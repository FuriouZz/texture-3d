'use strict'

const { vec3, mat4 } = require('gl-matrix')
const Material  = require('../../../engine/core/material')
const Texture3D = require('../../../engine/lib/texture-3d')
const Texture2D = require('nanogl/texture')

const M4 = mat4.create()
// const SIZE = 64

function generate( size ) {

  const scale = 0.1
  const data  = new Uint8Array(size * size * size)
  let value   = 0

  const c = 150 / 256
  const s = 0.65

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        value = window.Noises.perlin3( i * scale, j * scale, k * scale )
        // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )
        // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )
        // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )

        value = value - c
        value = 1 - Math.pow(s, value)

        value = Math.abs(value) * 256

        data[ i + j * size + k * size * size ] = value
      }
    }
  }

  return data

}

class CloudMaterial extends Material {

  constructor( gl, size ) {
    super( gl )

    this.size = size

    this.uDiffuseColor = vec3.fromValues(1, 1, 1)
    this.uTime = 0

    this.tNoise = new Texture3D( gl, gl.RED, gl.UNSIGNED_BYTE, gl.R8 )
    this.tNoise.bind()
    this.tNoise.setLevel( Math.log2(size) )
    this.tNoise.fromData( size, size, size, generate(size) )
    gl.generateMipmap(gl.TEXTURE_3D)

    this.tMask = new Texture2D( gl, gl.RED, gl.UNSIGNED_BYTE, gl.R8 )
    const $img = new Image
    $img.src   = 'assets/images/mask.jpg'
    $img.onload = () => {
      this.tMask.fromImage( $img )
    }

    this.cfg = gl.state.config()
    this.cfg.enableBlend()
    this.cfg.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.vertexShader   = require('./_vshader.glsl')
    this.fragmentShader = require('./_fshader.glsl')

    this.defs = '#version 300 es\n' + this.defs
    this.compile()
  }

  prepare( node, camera ) {
    super.prepare()

    this.cfg.apply()

    camera.modelViewProjectionMatrix( M4, node._wmatrix )
    this.uniform('uMVP', M4 )
    this.uniform('uDiffuseColor', this.uDiffuseColor)
    this.uniform('tNoise', this.tNoise)
    this.uniform('tMask', this.tMask)
    this.uniform('uTime', this.uTime)
  }

}

module.exports = CloudMaterial