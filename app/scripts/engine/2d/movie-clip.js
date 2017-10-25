'use strict'

const Node = require('nanogl-node')
const MovieClipMaterial = require('../materials/movie-clip/movie-clip')
const RectangleGeometry = require('nanogl-primitives-2d/rect')
const Sequence = require('../lib/sequence')

class MovieClip extends Sequence {

  constructor(gl, textureOrString, data) {
    super()

    this.gl = gl

    this.geometry = new RectangleGeometry(this.gl, 0, 0, 1, 1)
    this.material = new MovieClipMaterial(gl, textureOrString)

    this.node    = new Node
    this._origin = new Node
    this.origin  = [ 0.5, 0.5 ]
    this.node.add( this._origin )

    this.frames = []
    this.names  = []

    // Set frames
    if (data) this.setData(data)

    // GL State
    this.cfg = gl.state.config()
    this.cfg.enableBlend()
    this.cfg.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  }

  updateSize() {
    this._origin.scale[0] = this.frame.frame.w / MovieClip.scale
    this._origin.scale[1] = this.frame.frame.h / MovieClip.scale
    this.setOrigin( this.origin[0], this.origin[1] )
  }

  setOrigin(x, y) {
    this.origin[0] = x
    this.origin[1] = y

    this._origin.position[0] = this._origin.scale[0] * -this.origin[0]
    this._origin.position[1] = this._origin.scale[1] * -this.origin[1]

    this._origin.invalidate()
  }

  setData(data) {
    if (!(data && data.frames)) return
    this.data = data

    const frames = this.data.frames

    this.frames = []

    for (var key in frames) {
      this.frames.push( frames[key] )
      this.names.push( key )
    }

    this.index = -1
    this.setFrame( 0 )
  }

  setFrame( indexOrKey ) {
    let index

    if (typeof indexOrKey === 'string') {
      index = this.names.indexOf(indexOrKey)
      if (index === -1) return
    } else {
      index = indexOrKey
    }

    if (index === this.index) return

    super.setFrame( index )

    this.material.offset[0] = this.frame.frame.x / this.data.meta.size.w
    this.material.offset[1] = this.frame.frame.y / this.data.meta.size.h
    this.material.offset[2] = (this.frame.frame.x + this.frame.frame.w) / this.data.meta.size.w
    this.material.offset[3] = (this.frame.frame.y + this.frame.frame.h) / this.data.meta.size.h

    this.updateSize()
  }

  preRender(dt, time) {
    this._update( time )
  }

  render(dt, time, renderer) {
    this.material.prepare( this._origin, renderer.camera )

    this.geometry.attribPointer( this.material.prg )
    this.cfg.apply()
    this.geometry.render()
  }

  dispose() {
    this.geometry.dispose()
  }

}

module.exports = MovieClip