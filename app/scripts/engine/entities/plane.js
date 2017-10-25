'use strict'

const Mesh              = require('../core/mesh')
const BasicMaterial     = require('../materials/basic/basic')
const RectangleGeometry = require('../geometries/rectangle')

module.exports = class Plane extends Mesh {

  constructor( gl ) {
    super( gl )

    this.geometry = new RectangleGeometry( gl )
    this.geometry.allocate()

    this.material = new BasicMaterial( gl )
  }

}