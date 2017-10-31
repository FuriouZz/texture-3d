'use strict'

const Mesh          = require('../../../engine/core/mesh')
const CloudGeometry = require('./geometry')
const CloudMaterial = require('./material')

const SIZE = 64

class Cloud extends Mesh {

  constructor( gl ) {
    super( gl )

    this.geometry = new CloudGeometry( gl, SIZE )
    this.geometry.allocate()

    this.material = new CloudMaterial( gl, SIZE )
  }

  preRender(dt, time) {
    this.material.uTime = time
  }

}

module.exports = Cloud