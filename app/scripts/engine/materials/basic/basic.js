'use strict'

const { vec3, mat4 } = require('gl-matrix')
const Material = require('../../core/material')

const M4 = mat4.create()

class BasicMaterial extends Material {

  constructor(gl) {
    super(gl)

    this.diffuseColor = vec3.fromValues(1, 1, 1)
    this.teintColor   = vec3.fromValues(1, 1, 1)
    this.alpha        = 1

    this.vertexShader   = require('./basic.vert')
    this.fragmentShader = require('./basic.frag')

    this.compile()
  }

  prepare( node, camera ) {
    super.prepare()

    camera.modelViewProjectionMatrix( M4, node._wmatrix )
    this.uniform('uMVP', M4 )

    this.uniform('uDiffuseColor', this.diffuseColor )
    this.uniform('uTeintColor', this.teintColor )
    this.uniform('uAlpha', this.alpha )
  }

}

module.exports = BasicMaterial