'use strict'

const Mesh          = require('../core/mesh')
const BasicMaterial = require('../materials/basic/basic')
const BoxGeometry   = require('../geometries/box')

module.exports = class Cube extends Mesh {

  constructor(gl) {
    super()

    this.geometry = new BoxGeometry( gl )
    this.geometry.allocate()

    this.material = new BasicMaterial( gl )
  }

}