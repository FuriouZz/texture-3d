'use strict'

const { vec3, mat4 } = require('gl-matrix')
const { Texture } = require('nanogl')
const Material = require('../../core/material')
// const SpriteVertexShader = require('./sprite.vert')
// const SpriteFragmentShader = require('./sprite.frag')
const TextureLib = require('../../lib/texture-lib/texture-lib')

const M4 = mat4.create()

class SpriteMaterial extends Material {

  constructor(gl, textureOrString) {
    super(gl)

    if (typeof textureOrString === 'string') {
      this.texture = TextureLib.get(textureOrString)
    } else {
      this.texture = textureOrString
    }

    this.teintColor = vec3.fromValues(1, 1, 1)
    this.alpha      = 1
    this.flipY      = false

    this.vertexShader   = require('./sprite.vert')
    this.fragmentShader = require('./sprite.frag')
  }

  prepare( node, camera ) {
    super.prepare()

    this.program.use()

    camera.modelViewProjectionMatrix( M4, node._wmatrix )
    this.program.uMVP( M4 )

    this.program.uTeintColor( this.teintColor )
    this.program.uAlpha( this.alpha )
  }

}

module.exports = SpriteMaterial