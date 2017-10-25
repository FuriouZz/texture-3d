'use strict'

const EventEmitter = require('eventemitter3')

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

class Sequence extends EventEmitter {

  constructor(frames) {
    super()

    this._onRequetAnimationFrame = this._onRequetAnimationFrame.bind(this)

    this.frames      = frames || []
    this.frame       = null
    this.index       = 0

    this.paused          = true
    this.repeat          = false
    this.inverse         = false
    this.useInternalLoop = false
    this.duration        = 2
    this.timeBased       = true
    this.loop            = 0

    this._loopProgress = 0

    // Time based property
    this.prevTime    = -1
    this.currentTime = 0

    // Frame based property
    this.framePerSecond = 60

    //
    this._RAF = null

    if (this.frames.length > 0) {
      this.setFrame( 0 )
    }

    this.easing = function(t) {
      return t
    }

  }

  _start() {
    this.paused = false
    if (this.useInternalLoop) this._RAF = window.requestAnimationFrame(this._onRequetAnimationFrame)
  }

  _pause() {
    this.paused = true
    if (this.useInternalLoop) window.cancelAnimationFrame(this._RAF)
  }

  /**
   * Play sequence
   *
   *
   * @memberOf Sequence
   */
  play() {
    this.reset()
    this._start()
    this.emit('play', this)
  }

  /**
   * Resume sequence
   *
   *
   * @memberOf Sequence
   */
  resume() {
    this._start()
    this.emit('resume', this)
  }

  /**
   * Pause sequence
   *
   *
   * @memberOf Sequence
   */
  pause() {
    this._pause()
    this.emit('pause', this)
  }

  /**
   * Stop sequence
   *
   *
   * @memberOf Sequence
   */
  stop() {
    this._pause()
    this.reset()
    this.emit('stop', this)
  }

  /**
   * Play sequence in inverse
   *
   *
   * @memberOf Sequence
   */
  reverse() {
    this.inverse = true
    this.play()

    var scope = this
    var reset = function() {
      scope.inverse = false

      scope.off('stop', reset)
      scope.off('pause', reset)
    }

    this.on('stop', reset)
    this.on('pause', reset)
  }

  _onRequetAnimationFrame(time) {
    if (this.paused) return
    window.requestAnimationFrame(this._onRequetAnimationFrame)
    this._update( time )
  }

  /**
   * Update loop
   *
   * @param {Number} time
   *
   * @memberOf Sequence
   */
  _update( time ) {
    if (this.paused) return

    if (this.timeBased) {
      this._updateWithTime( time )/// 1000 )
    } else {
      this._updateWithFrame()
    }

    this.currentTime += this.delta
    this.progress = this.currentTime / this.duration
    this.progress = clamp(this.progress, 0, 1)
    this.progress = this.easing(this.progress, 0, Math.abs(0 - this.progress), 1)

    if (this.inverse) this.progress = 1 - this.progress

    var length = this.frames.length
    var T      = this.progress * length
    var index  = clamp( Math.floor(T), 0, length-1 )

    // Update frame
    if (index !== this.index) {
      this.setFrame( index )
    }

    if ((this.inverse && this.index === 0) || (!this.inverse && this.index === length-1)) {

      // If LOOP, then....loop
      if (this.loop) {
        this.currentTime = 0
        this.inverse = !this.inverse
        this._loopProgress+=0.5
      }

      // Repeat
      if (this.repeat) {
        this.currentTime = 0
      }
      // Stop
      else {

        // If LOOP, stop at the end of the loop
        if (this.loop) {
          if (this._loopProgress >= this.loop) this.stop()
        }

        // Else stop
        else {
          this.stop()
        }
      }
    }
  }

  _updateWithTime( time ) {
    if (this.prevTime === -1) this.prevTime = time
    this.delta    = time - this.prevTime
    this.prevTime = time
  }

  _updateWithFrame() {
    this.delta = 1/this.framePerSecond
  }

  /**
   * Reset sequence
   *
   *
   * @memberOf Sequence
   */
  reset() {
    this.prevTime      = -1
    this.currentTime   = 0
    this.progress      = 0
    this.delta         = 0
    this.index         = 0
    this._loopProgress = 0
  }

  /**
   * Set a new frame
   *
   * @param {Number} index
   *
   * @memberOf Sequence
   */
  setFrame( index ) {
    this.index = index
    this.frame = this.frames[this.index]
    this.emit('update_frame', this)
  }

}

module.exports = Sequence