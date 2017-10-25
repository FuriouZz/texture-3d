'use strict'

const ArrayBuffer = require('nanogl/arraybuffer')
const IndexBuffer = require('nanogl/indexbuffer')

class Geometry {

  /**
   * Creates an instance of Geometry.
   * @param {WebGLRenderingContext} gl
   * @param {number[]} vertices
   * @param {number[]} indices
   *
   * @memberof Geometry
   */
  constructor(gl, vertices, indices) {
    this.gl            = gl

    this._vertices = null
    this._indices  = null

    this.buffer  = null
    this.ibuffer = null

    this.drawingBuffer = null
    this.drawingMethod = 'drawTriangles'

    this.vertices = vertices
    if (indices) this.indices = indices
  }

  get vertices() {
    return this._vertices
  }

  set vertices(value) {
    if (Array.isArray(value)) this._vertices = new Float32Array(value)
    else this._vertices = value
  }

  get indices() {
    return this._indices
  }

  set indices(value) {
    if (Array.isArray(value)) this._indices = new Uint16Array(value)
    else this._indices = value
  }

  /**
   * Fill buffers with data
   *
   * @memberof Geometry
   */
  allocate() {
    this.buffer = new ArrayBuffer( this.gl )
    this.buffer.data( this.vertices )
    this.drawingBuffer = this.buffer

    if (this.indices) {
      this.ibuffer = new IndexBuffer( this.gl, this.gl.UNSIGNED_SHORT )
      this.ibuffer.data( this.indices )
      this.drawingBuffer = this.ibuffer
    }
  }

  /**
   * Clean buffers
   *
   * @memberof Geometry
   */
  deallocate() {
    if (this.buffer)  this.buffer.dispose()
    if (this.ibuffer) this.ibuffer.dispose()
  }

  /**
   * Bind program to buffer
   *
   * @memberof Geometry
   */
  bind( prg ) {
    this.buffer.attribPointer( prg );
    if ( this.indices ) this.ibuffer.bind()
  }

  /**
   * Add an attribute to the buffer
   *
   * @memberof Geometry
   */
  attrib(attributeName, size, type) {
    this.buffer.attrib( attributeName, size, type )
  }

  /**
   * Render geometry
   *
   * @memberof Geometry
   */
  render() {
    this.drawingBuffer[ this.drawingMethod ]()
  }

}

module.exports = Geometry