import Swal from 'sweetalert2'

import RemoteCalibrator from '../core'
import { swalInfoOptions } from '../components/swalOptions'
import { safeExecuteFunc } from '../components/utils'

RemoteCalibrator.prototype.getEquipment = async function (
  afterResultCallback,
  forcedGet = false
) {
  if (this.equipment && !forcedGet) return safeExecuteFunc(afterResultCallback)

  this._replaceBackground()
  const RC = this

  const { CM, IN_D, IN_F } = RC._CONST.UNITS
  const haveEquipmentOptions = {}
  haveEquipmentOptions[CM] = 'cm'
  haveEquipmentOptions[IN_D] = 'inch (Decimal, e.g. 11.5 in)'
  haveEquipmentOptions[IN_F] = 'inch (Fractional, e.g. 12 3/16 in)'

  const { value: result } = await Swal.fire({
    ...swalInfoOptions(RC, {
      showIcon: false,
    }),
    title: 'Do you have a measure tool?',
    input: 'select',
    inputOptions: {
      'I have an appropriate measuring tool in units': haveEquipmentOptions,
      "I don't have an appropriate measuring tool": {
        none: 'No device',
      },
    },
    inputPlaceholder: 'Select an option',
    // showCancelButton: true,
    inputValidator: value => {
      return new Promise(resolve => {
        const hasEquipment = value !== 'none'

        RC.newEquipmentData = {
          value: {
            has: hasEquipment,
            unit: hasEquipment ? value : null,
            equipment: hasEquipment ? '' : null,
          },
          timestamp: new Date(),
        }

        resolve()
      })
    },
  })

  if (result) return safeExecuteFunc(afterResultCallback)
}
