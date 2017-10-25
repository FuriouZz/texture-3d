'use strict'

const { vec2, vec3, mat4 } = require('gl-matrix')
const { Texture } = require('nanogl')
const Material = require('../../core/material')
const MovieClipVertexShader = require('./movie-clip.vert')
const MovieClipFragmentShader = require('./movie-clip.frag')

const M4 = mat4.create()

class MovieClipMaterial extends Material {

  constructor(gl, textureOrString) {
    super(gl)

    if (typeof textureOrString === 'string') {
      this.texture = TextureLib.get(textureOrString)
    } else {
      this.texture = textureOrString
    }

    this.teintColor = vec3.fromValues(1, 1, 1)
    this.offset     = vec2.fromValues(1, 1)
    this.alpha      = 1
    this.flipY      = false

    this.vertexShader   = MovieClipVertexShader
    this.fragmentShader = MovieClipFragmentShader
  }

  prepare( node, camera ) {
    super.prepare()

    camera.modelViewProjectionMatrix( M4, node._wmatrix )
    this.program.uniform('uMVP', M4 )

    this.program.uniform('uTeintColor', this.teintColor )
    this.program.uniform('uOffset', this.offset )
    this.program.uniform('uAlpha', this.alpha )
  }

}

module.exports = MovieClipMaterial