'use strict'

const Geometry = require('../core/geometry')
const RectangleBuffer = require('nanogl-primitives-2d/rect')

class RectangleGeometry extends Geometry {

  constructor( gl, x, y, w, h ) {
    super( gl )
    this.rect = { x, y, w, h }
  }

  allocate() {
    this.buffer = new RectangleBuffer(
      this.gl,
      this.rect.x, this.rect.y,
      this.rect.w, this.rect.h
    )

    this.drawingBuffer = this.buffer
    this.drawingMethod = 'drawTriangleStrip'
  }

  deallocate() {
    this.dispose()
  }

}

module.exports = RectangleGeometry