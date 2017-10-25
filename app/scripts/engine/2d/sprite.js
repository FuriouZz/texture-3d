'use strict'

const Node              = require('nanogl-node')
const RectangleGeometry = require('nanogl-primitives-2d/rect')
const SpriteMaterial    = require('../materials/sprite/sprite')

class Sprite {

  constructor(gl, textureOrString) {
    this.gl = gl

    this.geometry = new RectangleGeometry(this.gl, 0, 0, 1, 1)
    this.material = new SpriteMaterial(this.gl, textureOrString)

    this.node    = new Node
    this._origin = new Node
    this.origin  = [ 0.5, 0.5 ]
    this.node.add( this._origin )

    this.updateSize()

    this.cfg = gl.state.config()
    this.cfg.enableBlend()
    this.cfg.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  }

  updateSize() {
    this._origin.scale[0] = this.texture.width
    this._origin.scale[1] = this.texture.height
    this.setOrigin()
  }

  setOrigin(x, y) {
    this.origin[0] = this.origin[0] || x
    this.origin[1] = this.origin[1] || y

    this._origin.position[0] = this.texture.width  * -this.origin[0]
    this._origin.position[1] = this.texture.height * -this.origin[1]
    this._origin.invalidate()
  }

  render(dt, time, renderer) {
    this.material.prepare( this._origin, renderer.camera )

    this.geometry.attribPointer( this.material.program )
    this.cfg.apply()
    this.geometry.render()
  }

  dispose() {
    this.geometry.dispose()
  }

}

module.exports = Sprite