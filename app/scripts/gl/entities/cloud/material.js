'use strict'

const { vec3, mat4 } = require('gl-matrix')
const Material  = require('../../../engine/core/material')
const Texture3D = require('../../../engine/lib/texture-3d')
const Texture2D = require('nanogl/texture')

const M4 = mat4.create()
// const SIZE = 64

function perlin3(size) {
  const n   = []
  let value = 0

  for (let z = 0; z < size; z++) {
    n[z] = []
    for (let y = 0; y < size; y++) {
      n[z][y] = []
      for (let x = 0; x < size; x++) {
        // index = z + y * size + x * size * size
        value = (Math.random() * 32768) / 32768.0
        // n[ index ] = Math.abs(value) * 256
        n[z][y][x] = value
      }
    }
  }

  return n
}

function smoothNoise(noise, x, y, z, size) {
   //get fractional part of x and y
   const fractX = x - parseInt(x)
   const fractY = y - parseInt(y)
   const fractZ = z - parseInt(z)

   //wrap around
   const x1 = (parseInt(x) + size) % size
   const y1 = (parseInt(y) + size) % size
   const z1 = (parseInt(z) + size) % size

   //neighbor values
   const x2 = (x1 + size - 1) % size
   const y2 = (y1 + size - 1) % size
   const z2 = (z1 + size - 1) % size

   //smooth the noise with bilinear interpolation
   let value = 0.0
   value += fractX       * fractY       * fractZ * noise[z1][y1][x1]
   value += (1 - fractX) * fractY       * fractZ * noise[z1][y1][x2]
   value += fractX       * (1 - fractY) * fractZ * noise[z1][y2][x1]
   value += (1 - fractX) * (1 - fractY) * fractZ * noise[z1][y2][x2]

   value += fractX       * fractY       * (1 - fractZ) * noise[z2][y1][x1]
   value += (1 - fractX) * fractY       * (1 - fractZ) * noise[z2][y1][x2]
   value += fractX       * (1 - fractY) * (1 - fractZ) * noise[z2][y2][x1]
   value += (1 - fractX) * (1 - fractY) * (1 - fractZ) * noise[z2][y2][x2]

   return value
}

function turbulence(noise, x, y, z, tsize, size) {
  let value = 0
  const initialSize = tsize

  while(tsize > 1) {
    value += window.Noises.simplex3(x / tsize, y / tsize, z / tsize) * tsize
    // value += smoothNoise(noise, x / tsize, y / tsize, z / tsize, size) * tsize
    tsize *= 0.5
  }

  return (128 * value / initialSize)
}


function generate( size ) {

  const scale = 0.6
  const data  = new Uint8Array(size * size * size)

  const coverage  = 100
  const sharpness = 0.93

  const noise = perlin3( size )

  let value = 0
  let index = 0

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        index = z + y * size + x * size * size
        value = turbulence( noise, x * scale, y * scale, z * scale, 64, size )
        // value = 256 * smoothNoise( noise, x * scale, y * scale, z * scale, size )

        // optim part
        const e = value - coverage
        const d = 255 - 255 * Math.pow(sharpness, e)
        value   = Math.max(0, d)

        data[ index ] = value
      }
    }
  }

  window.DATA = data
  console.log( data )
  console.log( data.length )

  // const noise = perlin3( size, size, size, Math.random )

  // for (let i = 0; i < size; i++) {
  //   for (let j = 0; j < size; j++) {
  //     for (let k = 0; k < size; k++) {
  //       value = window.Noises.perlin3( i * scale, j * scale, k * scale )
  //       // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )
  //       // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )
  //       // value *= window.Noises.perlin3( i * scale, j * scale, k * scale )

  //       value = value - c
  //       value = 1 - Math.pow(s, value)

  //       value = Math.abs(value) * 256

  //       data[ i + j * size + k * size * size ] = value
  //     }
  //   }
  // }

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
    $img.src   = 'assets/images/mask2.jpg'
    $img.onload = () => {
      this.tMask.fromImage( $img )
    }

    this.cfg = gl.state.config()
    this.cfg.enableBlend()
    this.cfg.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    this.vertexShader   = require('./_vshader.glsl')
    this.fragmentShader = require('./_fshader.glsl')

    this.defs = '#version 300 es\n' + this.defs
    this.compile()
  }

  prepare( node, camera ) {
    super.prepare()

    this.cfg.apply()

    node.lookAt( camera.position )

    camera.modelViewProjectionMatrix( M4, node._wmatrix )
    this.uniform('uMVP', M4 )

    this.uniform('uModelMatrix', node._wmatrix )
    this.uniform('uCameraPosition', camera.position)
    this.uniform('uDiffuseColor', this.uDiffuseColor)
    this.uniform('tNoise', this.tNoise)
    this.uniform('tMask', this.tMask)
    this.uniform('uTime', this.uTime)
  }

}

module.exports = CloudMaterial