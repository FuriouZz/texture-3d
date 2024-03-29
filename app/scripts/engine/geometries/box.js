const Geometry = require('../core/geometry')

// X, Y, Z           U, V          NORMAL
var vertices = [
  // Top
  -0.5, 0.5, -0.5,   0.0, 0.0,     0.0, 1.0, 0.0,
  -0.5, 0.5, 0.5,    0.0, 1.0,     0.0, 1.0, 0.0,
  0.5, 0.5, 0.5,     1.0, 1.0,     0.0, 1.0, 0.0,
  0.5, 0.5, -0.5,    1.0, 0.0,     0.0, 1.0, 0.0,

  // Left
  -0.5, 0.5, 0.5,    0.0, 0.0,     -1.0, 0.0, 0.0,
  -0.5, -0.5, 0.5,   1.0, 0.0,     -1.0, 0.0, 0.0,
  -0.5, -0.5, -0.5,  1.0, 1.0,     -1.0, 0.0, 0.0,
  -0.5, 0.5, -0.5,   0.0, 1.0,     -1.0, 0.0, 0.0,

  // Right
  0.5, 0.5, 0.5,     1.0, 1.0,     1.0, 0.0, 0.0,
  0.5, -0.5, 0.5,    0.0, 1.0,     1.0, 0.0, 0.0,
  0.5, -0.5, -0.5,   0.0, 0.0,     1.0, 0.0, 0.0,
  0.5, 0.5, -0.5,    1.0, 0.0,     1.0, 0.0, 0.0,

  // Front
  0.5, 0.5, 0.5,     1.0, 1.0,     0.0, 0.0, 1.0,
  0.5, -0.5, 0.5,    1.0, 0.0,     0.0, 0.0, 1.0,
  -0.5, -0.5, 0.5,   0.0, 0.0,     0.0, 0.0, 1.0,
  -0.5, 0.5, 0.5,    0.0, 1.0,     0.0, 0.0, 1.0,

  // Back
  0.5, 0.5, -0.5,    0.0, 0.0,     0.0, 0.0, -1.0,
  0.5, -0.5, -0.5,   0.0, 1.0,     0.0, 0.0, -1.0,
  -0.5, -0.5, -0.5,  1.0, 1.0,     0.0, 0.0, -1.0,
  -0.5, 0.5, -0.5,   1.0, 0.0,     0.0, 0.0, -1.0,

  // Bottom
  -0.5, -0.5, -0.5,   1.0, 1.0,     0.0, -1.0, 0.0,
  -0.5, -0.5, 0.5,    1.0, 0.0,     0.0, -1.0, 0.0,
  0.5, -0.5, 0.5,     0.0, 0.0,     0.0, -1.0, 0.0,
  0.5, -0.5, -0.5,    0.0, 1.0,      0.0, -1.0, 0.0
];

var indices = [
  // Top
  0, 1, 2,
  0, 2, 3,

  // Left
  5, 4, 6,
  6, 4, 7,

  // Right
  8, 9, 10,
  8, 10, 11,

  // Front
  13, 12, 14,
  15, 14, 12,

  // Back
  16, 17, 18,
  16, 18, 19,

  // Bottom
  21, 20, 22,
  22, 20, 23
];


class BoxGeometry extends Geometry {

  constructor( gl ) {

    super( gl, vertices, indices )

  }

  allocate(){

    super.allocate()

    var gl = this.gl

    this.attrib( 'aPosition', 3, gl.FLOAT )
    this.attrib( 'aUv', 2, gl.FLOAT )
    this.attrib( 'aNormal', 3, gl.FLOAT )

  }

}

module.exports = BoxGeometry