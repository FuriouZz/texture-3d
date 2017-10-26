'use strict'

const Node   = require('nanogl-node')
const Camera = require('nanogl-camera')
const Plane  = require('./engine/entities/plane')
const Cloud  = require('./gl/entities/cloud')

const CameraSwitcher    = require('./engine/camera/switcher')
const BlenderController = require('./engine/camera/blender-controller')

class Scene {

  constructor(renderer) {
    this._onPreRender = this._onPreRender.bind(this)
    this._onRender    = this._onRender.bind(this)
    this._onResize    = this._onResize.bind(this)

    this.gl       = renderer.gl
    this.renderer = renderer
    this.node     = new Node
    this.renderer.root.add( this.node )

    this.camera = Camera.makePerspectiveCamera()
    this.camera.lens.setAutoFov( 43.68 / 180 * Math.PI )
    this.camera.lens.aspect = this.width / this.height
    this.camera.lens.far    = 12000.
    this.camera.z           = 1
    this.node.add( this.camera )

    this.cameraSwitcher = new CameraSwitcher( this.camera )
    this.cameraSwitcher.controllers = {
      "blender": new BlenderController( this.renderer.canvas )
    }

    this.cameraSwitcher.setController( 'blender' )

    // this.plane = new Plane( this.renderer.gl )
    // this.plane.material.diffuseColor = [ 1, 0, 0 ]
    // this.plane.node.setScale(1)
    // this.plane.node.z = -5
    // this.plane.node.rotateY(Math.PI * -0.25)
    // this.node.add( this.plane.node )

    this.cloud = new Cloud( this.renderer.gl )
    this.cloud.node.setScale(1)
    this.cloud.node.z = -5
    this.cloud.node.rotateY(Math.PI * -0.15)
    this.node.add( this.cloud.node )
  }

  activate() {
    this.renderer.events.on( 'resize', this._onResize )
    this.renderer.events.on( 'prerender', this._onPreRender )
    this.renderer.events.on( 'render', this._onRender )
    this._onResize()
  }

  desactivate() {
    this.renderer.events.off( 'resize', this._onResize )
    this.renderer.events.off( 'prerender', this._onPreRender )
    this.renderer.events.off( 'render', this._onRender )
  }

  _onResize() {
    this.camera.updateViewProjectionMatrix( this.renderer.width, this.renderer.height )
  }

  _onPreRender(dt, time, renderer) {
    this.cameraSwitcher.update( dt )

    // this.cloud.node.rotateY(-0.01)
    this.cloud.preRender( dt, time, this )
  }

  _onRender(dt, time, renderer) {
    this.cloud.render( dt, time, this )
  }

}

module.exports = Scene