'use strict'


class CameraSwitch {

  constructor( camera ) {
    this.controller  = null
    this.controllers = {}
    this.camera      = camera
    this.test        = function() {
      console.log(arguments)
    }
  }

  // setupGUI() {
  //   const GUI    = require('common/helpers/gui')
  //   const folder = GUI.addFolder('camera controllers')
  //   const obj    = {}
  //   for (const key in this.controllers) {
  //     obj[key] = () => { this.setController( key ) }
  //     folder.add(obj, key)
  //   }
  // }

  setController( name ) {
    if (!this.controllers.hasOwnProperty(name)) return
    if (this.controller) this.controller.stop()
    this.controller = this.controllers[name]
    this.controller.start( this.camera )
  }

  update( dt ) {
    if (this.controller) this.controller.update( dt )
  }

}

module.exports = CameraSwitch