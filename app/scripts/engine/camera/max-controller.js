
var glmat = require( 'gl-matrix' );

var vec3 = glmat.vec3,
    quat = glmat.quat,
    mat4 = glmat.mat4;

var NULL_QUAT = quat.create()
var Q1        = quat.create()
var Q2        = quat.create()
var V1        = vec3.create();
var V2        = vec3.create();
var MAT4      = mat4.create();
var IMVP      = mat4.create();

var IDLE  = 0,
    ORBIT = 1,
    PAN   = 2,
    DOLLY = 4;


function setMousePos( e, el, v3 ){
  var cX, cY;
  if( e.touches && e.touches[0]){
    cX =  e.touches[0].clientX
    cY =  e.touches[0].clientY
  } else {
    cX =  e.clientX
    cY =  e.clientY
  }
  v3[0] =   2 * cX / (el.width )- 1
  v3[1] = -(2 * cY / (el.height) - 1)

}





function CameraControl( scene ){
  this.scene = scene;
  this.el    = scene.glview.canvas
  // this.el    = scene.glview.canvas
  this.mouse       = vec3.fromValues(0, 0, 1);
  this.cam         = null;
  this.orbitRadius = -.5;
  this.mode        = -1;

  this.onMouseMove =  this._onMouseMove.bind( this );
  this.onMouseDown =  this._onMouseDown.bind( this );

}


CameraControl.prototype = {


  start : function( cam ){
    this.cam = cam;
    var el = this.el;
    // var el = document.body;

    el.addEventListener( 'mousemove', this.onMouseMove );
    el.addEventListener( 'touchmove', this.onMouseMove );
    el.addEventListener( 'touchstart',this.onMouseMove );
    el.addEventListener( 'mousedown', this.onMouseDown );
    this.mode        = -1;
    this.setMode( IDLE )
  },

  stop : function( cam ){
    this.cam = null;
    this.el.removeEventListener( 'mousemove', this.onMouseMove );
  },

  update : function( dt ){
    // noop
  },

  setMode : function( mode ){
    if( this.mode === mode ) return;
    this.mode = mode;
    switch( mode ){
      case IDLE :
        this.action = new IdleAction()
        break;
      case ORBIT :
        this.action = new OrbitAction()
        break;
      case PAN :
        this.action = new PanAction()
        break;
      case DOLLY :
        this.action = new DollyAction()
        break;
    }

    this.unproject( V1 );
    V1[0]=0;
    V1[1]=0;
    this.action.start( this.cam, V1, this.mouse )

  },

  unproject : function( out ){
    var rad = -vec3.length( this.cam.position )
    this.cam.updateMatrix()
    mat4.invert( IMVP, this.cam.lens._proj );
    vec3.transformMat4( V1, this.mouse, IMVP );
    vec3.scale( V1, V1, rad / V1[2] )
    vec3.transformMat4( out, V1, this.cam._matrix );
  },



  _onMouseMove : function( e ){
    var mode = this._getModeForEvt(e)
    this.setMode( mode );
    setMousePos( e, this.el, this.mouse );
    this.action.update( this.mouse );
  },


  _onMouseDown : function( e ){
    // if( e .which === 3 ) {
      e.preventDefault();
      return false;
    // }
  },

  _onTouchEnd : function( e ){
    this.setMode( IDLE );
  },


  _getModeForEvt : function( e ){
    if( e.type === 'touchmove' ){
      return ORBIT;
    }
    if( e.type === 'touchstart' ){
      return IDLE;
    }
    if( e .buttons !==  4 ) return IDLE

    if( e.altKey ){
      return e.ctrlKey ? DOLLY : ORBIT
    }
    return PAN;
  }

}




function IdleAction(){
}

IdleAction.prototype = {
  start:function(){
  },
  update:function(){},
}




function OrbitAction(){

  this.initialX   = vec3.create()
  this.initialR   = quat.create()
  this.initialP   = vec3.create()
  this.startMouse = vec3.create()
  this.focus      = vec3.create()

}


OrbitAction.prototype = {

  start : function( cam, focus, mouse ){
    this.cam = cam;
    vec3.copy( this.initialX,  this.cam._matrix)
    vec3.copy( this.startMouse, mouse );

    quat.copy( this.initialR, cam.rotation );
    vec3.subtract( this.initialP, cam.position, focus );

    vec3.copy( this.focus,      focus );

  },

  update : function( mouse ){

    vec3.subtract( V1, mouse, this.startMouse );

    quat.setAxisAngle( Q2, this.initialX, V1[1] * 5)
    quat.rotateY(      Q1, NULL_QUAT,     -V1[0] * 5);
    quat.multiply(     Q1, Q1, Q2 )

    quat.multiply( this.cam.rotation, Q1, this.initialR );
    vec3.transformQuat( V1, this.initialP, Q1 );
    vec3.add( this.cam.position, this.focus, V1 );

    this.cam.invalidate()

  }

}






function PanAction(){

  this.initialX   = vec3.create()
  this.initialY   = quat.create()
  this.initialP   = vec3.create()
  this.startMouse = vec3.create()
  this.focus      = vec3.create()

}


PanAction.prototype = {

  start : function( cam, focus, mouse ){
    this.cam = cam;
    vec3.copy( this.initialX,  this.cam._matrix );
    vec3.copy( this.initialP,  this.cam.position );
    this.initialY[0] = this.cam._matrix[4];
    this.initialY[1] = this.cam._matrix[5];
    this.initialY[2] = this.cam._matrix[6];
    vec3.copy( this.startMouse, mouse );
    vec3.copy( this.focus,      focus );

  },

  update : function( mouse ){

    vec3.subtract( V1, mouse, this.startMouse );

    vec3.scale( V2, this.initialX, -V1[0] * 5 )
    vec3.scaleAndAdd( V2, V2, this.initialY, -V1[1] * 5 )


    vec3.add( this.cam.position, this.initialP, V2 );

    this.cam.invalidate()

  }

}




function DollyAction(){

  this.initialZ   = vec3.create()
  this.initialP   = vec3.create()
  this.startMouse = vec3.create()
  this.focus      = vec3.create()

}


DollyAction.prototype = {

  start : function( cam, focus, mouse ){
    this.cam = cam;
    vec3.copy( this.initialP,  this.cam.position );
    vec3.subtract( this.initialZ, this.cam.position, focus );
    vec3.copy( this.startMouse, mouse );
    vec3.copy( this.focus,      focus );

  },

  update : function( mouse ){

    vec3.subtract( V1, mouse, this.startMouse );

    vec3.scale( V1, this.initialZ, V1[1] * 5 )
    vec3.add( this.cam.position, this.initialP, V1 );

    this.cam.invalidate()

  }

}

module.exports = CameraControl;