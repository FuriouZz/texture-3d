'use strict'

const Node = require('nanogl-node')

class Mesh {

  constructor(geometry, material) {
    this.geometry = geometry
    this.material = material

    this.node = new Node
  }

  preRender(dt, time, scene) {}

  render(dt, time, scene) {
    this.material.prepare( this.node, scene.camera )

    this.geometry.bind( this.material.program )
    this.geometry.render()
  }

  dispose() {
    this.geometry.deallocate()
  }

}

module.exports = Mesh