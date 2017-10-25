'use strict'

const EventEmitter = require('eventemitter3')
const Renderer = require('nanogl-renderer')
const Node = require('nanogl-node')

module.exports = Renderer({

  init() {
    this.root = new Node

    window.addEventListener('resize', this.resize.bind(this))

    this.TIME = 0
    this.dt   = 0
    this.framerate = 0

    this.FRAME = 0
    this.FRAME_TIME = 0

    this.events = new EventEmitter
    this.events.emit('init')
  },

  getContextOptions() {
    return {
      depth: false,
      stencil: false,
      alpha: false,
      antialias: false
    }
  },

  render( dt ) {

    this.TIME += dt
    this.dt = dt

    this.FRAME++
    this.FRAME_TIME += dt

    if (this.FRAME_TIME > 1/4) {
      this.framerate = this.FRAME / this.FRAME_TIME
      this.FRAME = 0
      this.FRAME_TIME -= 1 / 4
    }

    this.root.updateWorldMatrix()

    this.events.emit('prerender', dt, this.TIME, this)

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 )
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT )
    this.gl.viewport(0, 0, this.width, this.height)

    this.events.emit('render', dt, this.TIME, this)

  },

  resize() {
    this.events.emit('resize', this.width, this.height, this.canvasWidth, this.canvasHeight)
  }

})