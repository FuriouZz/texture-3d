'use strict'

const ArrayBuffer = require('nanogl/arraybuffer')
const IndexBuffer = require('nanogl/indexbuffer')

const POSITIONS = new Float32Array([
  // pos     // uv  // normal
  -1, -1, 0, 0, 0,  0, 0, 1,
  -1,  1, 0, 0, 1,  0, 0, 1,
   1, -1, 0, 1, 0,  0, 0, 1,
   1,  1, 0, 1, 1,  0, 0, 1
])

const INDICES = new Uint8Array([
  0, 1, 2,
  2, 1, 3
])

class RectangleGeometry {

  constructor( gl, size ) {
    this.gl   = gl
    this.size = size
  }

  bind( program ) {
    // Bind attributes
    this.buffer.attribPointer( program )

    // Bind instancied attributes
    this.slices.attribPointer( program )
    this.gl.vertexAttribDivisor(program[this.slices.attribs[0].name](), 2)

    // Bind index buffer
    this.indices.bind()
  }

  allocate() {
    const gl = this.gl

    this.buffer = new ArrayBuffer( gl )
    this.buffer.data( POSITIONS )

    this.indices = new IndexBuffer( gl, gl.UNSIGNED_BYTE )
    this.indices.data( INDICES )

    this.buffer.attrib( 'aPosition', 3, gl.FLOAT )
    this.buffer.attrib( 'aTexCoord', 2, gl.FLOAT )
    this.buffer.attrib( 'aNormal'  , 3, gl.FLOAT )

    const data = new Float32Array(this.size)
    for (let i = 0; i < this.size*2; i+=2) {
      data[i+0] = i / this.size
      data[i+1] = Math.random() * 2
    }

    this.slices = new ArrayBuffer( gl )
    this.slices.data( data )
    this.slices.attrib( 'iDepth', 2, gl.FLOAT )
  }

  deallocate() {
    this.buffer .dispose()
    this.indices.dispose()
  }

  render() {
    const gl    = this.gl
    const count = this.indices.size/this.indices.typeSize

    gl.drawElementsInstanced(
      gl.TRIANGLES,
      count,
      this.indices.type,
      0,
      this.size
    )
  }

}

module.exports = RectangleGeometry