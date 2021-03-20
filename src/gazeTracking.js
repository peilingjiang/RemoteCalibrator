import webgazer from './WebGazer/dist/webgazer.commonjs2.min'

import {
  addBackground,
  constructInstructions,
  getFullscreen,
  removeBackground,
  shuffle,
} from './helpers'
import { gazeCalibrationDotDefault } from './constants'
import { checkWebgazerReady } from './video'
import data from './results'

const debug = true

// [Wait!], etc.
const instPOutsideWarning =
  'Make sure your face is always at the center of the screen.'

export function gazeTracking(callback, options) {
  /**
   * options -
   *
   * fullscreen: [Boolean]
   * showGazer: [Boolean]
   * pipWidth: [208]
   * greedyLearner: [Boolean] If false, stop learning after calibration process // TODO
   * showVideo: [Boolean]
   * showFaceOverlay: [Boolean]
   * checkAccuracy: [Boolean] // TODO
   * leastRequiredAccuracy: [Boolean] // TODO
   * headline: [String]
   * description: [String]
   *
   */

  options = Object.assign(
    {
      fullscreen: true,
      showGazer: true,
      pipWidth: 208,
      greedyLearner: true,
      showVideo: true,
      showFaceOverlay: false,
      headline: '👀 Live Gaze Tracking',
      description:
        "We'll keep track of your gaze position. First, we need to calibrate for the system. \nPlease enable camera access and move your body to the center so that the square becomes green. \nPlease then follow the instructions below to finish the calibration.",
    },
    options
  )
  // Fullscreen
  if (options.fullscreen && !debug) getFullscreen()

  const background = addBackground(
    constructInstructions(options.headline, options.description)
  )

  /* Video - using native WebGazer video element right now */
  // const [video, vC, vCtx] = addVideoElementsToBody()
  // const projectVideoToCanvas = () => {
  //   drawVideoOnCanvas(video, vCtx, vC.width, vC.height)
  //   requestAnimationFrame(projectVideoToCanvas)
  // }
  // startVideo(video, (stream) => {
  //   formatVideoCanvas(vC, stream, options.pipWidth)
  //   requestAnimationFrame(projectVideoToCanvas)
  // })

  // Add instructions
  const instP = document.createElement('p')
  instP.id = 'gaze-system-instruction'
  instP.className = 'float-instruction'
  instP.innerHTML = 'Loading... Please wait.' // Init
  background.appendChild(instP)

  // TODO Handle the second entry of the program
  // ! WebGazer
  ////
  webgazer.clearData()
  window.saveDataAcrossSessions = false
  ////
  webgazer.showVideo(options.showVideo)
  webgazer.showFaceOverlay(options.showFaceOverlay)
  webgazer.showPredictionPoints(options.showGazer)

  webgazer
    .setGazeListener(d => {
      // ! Put data into data and callback function
      if (d) {
        callback(
          (data.gazePosition = {
            x: d.x.toFixed(3),
            y: d.y.toFixed(3),
            timestamp: new Date(),
          })
        )
      }
    })
    .begin()

  checkWebgazerReady(options, webgazer, () => {
    // instP
    instP.innerHTML = instPOutsideWarning
    startCalibration(background, instP, onCalibrationEnded)
  })

  const onCalibrationEnded = () => {
    // TODO Check accuracy and re-calibrate if needed
    removeBackground()
    webgazer.end()
  }
}

const startCalibration = (bg, p, onCalibrationEnded) => {
  p.innerHTML += `\nPlease click on the <b style="color: #ff005c">Pink</b> dots on the center and edges of the window until it disappears.`
  new GazeCalibrationDot(document.body, onCalibrationEnded)
}

class GazeCalibrationDot {
  constructor(parent, endCalibrationCallback) {
    // Order
    this._randomOrder()

    this.position = this.order.shift()
    this.r = gazeCalibrationDotDefault.r

    // HTML div
    this.div = document.createElement('div')
    this.div.className = 'gaze-calibration-dot'
    this.clickDiv = document.createElement('div')
    this.clickDiv.className = 'gaze-calibration-dot-click'
    this.div.appendChild(this.clickDiv)

    Object.assign(this.div.style, {
      width: this.r + 'px',
      height: this.r + 'px',
      borderRadius: this.r / 2 + 'px',
    })
    Object.assign(this.clickDiv.style, {
      width: this.r - gazeCalibrationDotDefault.border + 'px',
      height: this.r - gazeCalibrationDotDefault.border + 'px',
      borderRadius: (this.r - gazeCalibrationDotDefault.border) / 2 + 'px',
      top: `${gazeCalibrationDotDefault.border / 2}px`,
      left: `${gazeCalibrationDotDefault.border / 2}px`,
    })

    this.parent = parent
    parent.appendChild(this.div)
    this.placeDot()

    this.clickThreshold = debug ? 1 : 5 // How many times required to click for each position
    this.clicks = 0

    this.clickDiv.addEventListener('click', this.takeClick.bind(this), false)
    this.endCalibrationCallback = endCalibrationCallback
  }

  placeDot() {
    // Width
    Object.assign(
      this.div.style,
      [
        { left: gazeCalibrationDotDefault.margin + 'px', right: 'unset' }, // 0
        {
          left: `calc(50% - ${gazeCalibrationDotDefault.r / 2}px)`,
          right: 'unset',
        }, // 1
        { right: gazeCalibrationDotDefault.margin + 'px', left: 'unset' }, // 2
      ][this.position[0]],
      [
        { top: gazeCalibrationDotDefault.margin + 'px', bottom: 'unset' }, // 0
        {
          top: `calc(50% - ${gazeCalibrationDotDefault.r / 2}px)`,
          bottom: 'unset',
        }, // 1
        { bottom: gazeCalibrationDotDefault.margin + 'px', top: 'unset' }, // 2
      ][this.position[1]]
    )
  }

  takeClick() {
    this.clicks++
    if (this.clicks >= this.clickThreshold) {
      if (this.order.length) {
        this.position = this.order.shift()
        this.placeDot()
        this.clicks = 0
      } else {
        // Finish calibration
        this.deleteSelf()
      }
    }
  }

  deleteSelf() {
    this.clickDiv.removeEventListener('click', this.takeClick, false)
    this.parent.removeChild(this.div)

    // onCalibrationEnded
    this.endCalibrationCallback()
  }

  _randomOrder() {
    this.order = []
    for (let i of [0, 1, 2]) for (let j of [0, 1, 2]) this.order.push([i, j])
    shuffle(this.order)
  }
}

/* -------------------------------------------------------------------------- */

class GazeTracker {
  constructor(WG) {
    this.webgazer = WG
  }

  begin() {
    this.webgazer.begin()
  }

  end() {
    this.webgazer.end()
  }
}

// Export for interacting with WebGazer outside
export const gazeTracker = new GazeTracker(webgazer)

/* -------------------------------------------------------------------------- */
