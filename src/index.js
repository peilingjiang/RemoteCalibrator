import RemoteCalibrator from './core'

import './const'

import './screenSize'

import './distance/distance'
import './distance/distanceTrack'
import './distance/distanceCheck'
import './distance/interPupillaryDistance'

import './gaze/gaze'
import './gaze/gazeCalibration'
import './gaze/gazeAccuracy'
import GazeTracker from './gaze/gazeTracker'

import './check/checkScreenSize'

import './panel'
import './customization'

/* ----------------------------------- CSS ---------------------------------- */

// Internal
import './css/main.css'
import './css/screenSize.scss'
import './css/distance.scss'
import './css/gaze.css'
import './css/video.scss'

// External
import 'animate.css/source/_vars.css'
import 'animate.css/source/_base.css'
import 'animate.css/source/fading_entrances/fadeInUp.css'
import 'animate.css/source/fading_exits/fadeOutDown.css'
import 'sweetalert2/src/sweetalert2.scss'

// Components
import './css/swal.css'
import './css/buttons.scss'
import './css/slider.scss'
import './css/check.scss'

const r = new RemoteCalibrator()
r.gazeTracker = new GazeTracker(r)

export default r
