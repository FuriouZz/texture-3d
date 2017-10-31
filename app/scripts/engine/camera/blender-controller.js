'use strict'

const glMatrix = require( 'gl-matrix' )
const vec3 = glMatrix.vec3
const quat = glMatrix.quat
const mat4 = glMatrix.mat4
const mat3 = glMatrix.mat3

const NOOP = function() {}

const MODE = Object.freeze({
  IDLE: 'idle',
  ZOOM: 'zoom',
  PAN: 'pan',
  ORBIT: 'orbit'
})


var V1        = vec3.create(),
    V2        = vec3.create(),
    V3        = vec3.create(),
    IMVP      = mat4.create(),
    Q1        = quat.create(),
    Q2        = quat.create(),
    NULL_QUAT = quat.create(),
    UP        = [0, 1, 0]

var MAT3 = mat3.create(),
    VX   = new Float32Array( MAT3.buffer, 0*4, 3 ),
    VY   = new Float32Array( MAT3.buffer, 3*4, 3 ),
    VZ   = new Float32Array( MAT3.buffer, 6*4, 3 );

function setMousePosition(e, el, v) {
  v[0] =  (2 * e.clientX / el.width  - 1)
  v[1] = -(2 * e.clientY / el.height - 1)

  // v[0] = Math.max(-1, Math.min(v[0], 1))
  // v[1] = Math.max(-1, Math.min(v[1], 1))
}


function BlenderController( el ) {
  this._onMouseMove  = this._onMouseMove.bind(this)
  this._onMouseWheel = this._onMouseWheel.bind(this)

  this.$el    = el
  this.mouse  = vec3.fromValues(0, 0, 1)
  this.camera = null

  this.mode   = null
  this.action = null

  this.orbit = vec3.fromValues(0, 0, 0)
  // this.orbitRadius = -30

  this.delta  = [0, 0]
}

BlenderController.prototype = {

  start: function( camera ) {
    this.camera = camera

    // Set orbit in front of the camera of radius 5
    mat3.fromQuat(MAT3, this.camera.rotation)
    vec3.scale(this.orbit, VZ, -5)

    this.$el.addEventListener('mousemove', this._onMouseMove)
    this.$el.addEventListener('mousewheel', this._onMouseWheel)
  },

  stop: function() {
    this.camera = null
    this.$el.removeEventListener('mousemove', this._onMouseMove)
    this.$el.removeEventListener('mousewheel', this._onMouseWheel)
  },

  update: NOOP,

  _onMouseMove: function(e) {
    setMousePosition(e, this.$el, this.mouse)

    const mode = this._getMode(e)
    this.setMode( mode )
    this.action.update( this.mouse )
  },

  _onMouseWheel: function(e) {
    e.preventDefault()

    this.delta[0] += e.deltaX
    this.delta[1] += e.deltaY

    setMousePosition({ clientX: this.delta[0], clientY: this.delta[1] }, this.$el, this.mouse)

    const mode = this._getMode(e)
    this.setMode( mode )
    this.action.update( this.mouse )
  },

  _getMode: function( e ) {
    if (e.which !== 1) return

    if ( e.shiftKey ) {
      return MODE.PAN
    } else if ( e.ctrlKey ) {
      return MODE.ZOOM
    }

    return MODE.ORBIT
  },

  setMode: function( mode ) {
    if (this.mode === mode) return

    this.mode = mode

    switch( mode ) {
      case MODE.ZOOM:
        this.action = new ZoomAction
        break;
      case MODE.PAN:
        this.action = new PanAction
        break;
      case MODE.ORBIT:
        this.action = new OrbitAction
        break;
      default:
        this.action = new IdleAction
    }

    this.unproject( V1 )
    this.action.start( this.camera, this.orbit, this.mouse )
  },

  unproject: function( v ) {
    this.camera.updateMatrix()

    mat4.invert( IMVP, this.camera.lens._proj )
    vec3.transformMat4( V1, this.mouse, IMVP )
    vec3.scale( V1, V1, this.orbitRadius / v[2] )
    vec3.transformMat4( v, V1, this.camera._matrix )
  }

}



/**
 *
 * Pan action
 *
 */
function PanAction() {

  this.initialP       = vec3.create()
  this.initialTargetP = vec3.create()
  this.initialMouse   = vec3.create()
  this.direction      = vec3.create()

  this.camera = null
  this.target = null
}

PanAction.prototype = {
  start: function( camera, target, mouse ) {

    this.camera = camera
    this.target = target

    vec3.copy(this.initialP, camera.position)
    vec3.copy(this.initialTargetP, target)
    vec3.copy(this.initialMouse, mouse)

    vec3.subtract(this.direction, this.camera.position, target)

  },

  update: function( mouse ) {

    vec3.subtract(V1, this.initialMouse, mouse)

    vec3.cross(V2, this.direction, UP) // X
    vec3.cross(V3, this.direction, V2) // Y

    vec3.scale(V2, V2, V1[0])
    vec3.scale(V3, V3, V1[1])
    vec3.add(V2, V2, V3)
    vec3.add(this.camera.position, this.initialP, V2)
    vec3.add(this.target, this.initialTargetP, V2)

    this.camera.invalidate()

  }
}



/**
 *
 * Zoom action
 *
 */
function ZoomAction() {
  this.initialP     = vec3.create()
  this.initialZ     = vec3.create()
  this.initialMouse = vec3.create()

  this.minRadius    = 5
  this.camera       = null
}

ZoomAction.prototype = {
  start: function( camera, target, mouse ) {
    this.camera = camera

    vec3.copy( this.initialP, camera.position )
    vec3.subtract( this.initialZ, camera.position, target )
    vec3.copy( this.initialMouse, mouse )
  },

  update: function( mouse ) {
    vec3.subtract(V1, mouse, this.initialMouse)
    vec3.scale(V1, this.initialZ, V1[1] * 5)
    vec3.add(this.camera.position, this.initialP, V1)

    this.camera.invalidate()
  }
}



/**
 *
 * Orbit action
 *
 */
function OrbitAction() {
  this.direction       = vec3.create()
  this.initialMouse   = vec3.create()

  this.initialR = quat.create()
  this.initialX = vec3.create()

  this.camera = null
  this.target = vec3.create()
}

OrbitAction.prototype = {
  start: function( camera, target, mouse ) {
    this.camera = camera

    vec3.copy( this.initialX, this.camera._matrix )
    vec3.copy( this.initialMouse, mouse )

    quat.copy( this.initialR, this.camera.rotation )
    vec3.subtract( this.direction, camera.position, target)

    vec3.copy( this.target, target )
  },

  update: function( mouse ) {
    vec3.subtract( V1, mouse, this.initialMouse )

    quat.setAxisAngle( Q2, this.initialX, V1[1] * 5)
    quat.rotateY(      Q1, NULL_QUAT,    -V1[0] * 5)
    quat.multiply(     Q1, Q1, Q2 )

    quat.multiply( this.camera.rotation, Q1, this.initialR )
    vec3.transformQuat( V2, this.direction, Q1 )
    vec3.add( this.camera.position, this.target, V2 )

    this.camera.invalidate()

  }
}


/**
 *
 * Idle action
 *
 */
function IdleAction() {}

IdleAction.prototype = {
  start: NOOP,
  update: NOOP
}

module.exports = BlenderController