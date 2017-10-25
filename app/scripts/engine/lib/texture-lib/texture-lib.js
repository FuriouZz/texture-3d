'use strict'

const DDSParser = require('./dds-parser')
const KTXParser = require('./ktx-parser')
const PVRParser = require('./pvr-parser')

const { Texture, TextureCube } = require('nanogl')
const Net = require('../net')

const when = require('when')

class TextureLib {

  setup(gl) {
    this.gl = gl

    this.bbc = true

    this.extAniso =
         gl.getExtension("MOZ_EXT_texture_filter_anisotropic")
      || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
      || gl.getExtension("EXT_texture_filter_anisotropic")

    this.maxAniso = (this.extAniso) ? gl.getParameter(this.extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0

    this.DDSParser = new DDSParser( gl )
    this.KTXParser = new KTXParser( gl )
    this.PVRParser = new PVRParser( gl )

    this._textures = {}
    this._items    = {}
  }

  get manifest() {
    return this._items
  }

  get(key) {
    return this._textures[key]
  }

  register(key, item) {
    if (this._textures[ key ] === undefined) {
      item.id = key
      this._textures[ key ] = item.texture
      this._items[ key ]    = item
    }
  }

  makeTexture(key, item) {
    const texture = new Texture( this.gl, item.options.format )
    item.texture  = texture
    item.type     = 'nanogl-texture'
    this.register(key, item)
  }

  makeTextureCube(key, item) {
    const texture = new TextureCube( this.gl, item.options.format )
    item.texture  = texture
    item.type     = 'nanogl-texture-cube'
    this.register(key, item)
  }

  addLoaders( loader ) {
    loader.addType('nanogl-texture', this.getTextureLoader())
    loader.addType('nanogl-texture-cube', this.getCubeTextureLoader())
  }

  getTextureLoader() {
    const scope = this
    return function(item) {
      if (item.id) scope.makeTexture(item.id, item)
      return TextureLoader.apply(scope, arguments)
    }
  }

  getCubeTextureLoader() {
    const scope = this
    return function(item) {
      if (item.id) scope.makeTextureCube(item.id, item)
      return CubeTextureLoader.apply(scope, arguments)
    }
  }

}


const TextureLibSingleton = new TextureLib
module.exports = TextureLibSingleton


/**
 * Texture loader function
 *
 * @param {Object} item
 * @param {Function} onFileLoaded
 * @param {Function} onFileError
 * @returns {Function}
 */
function TextureLoader(item, onFileLoaded, onFileError) {

  const options = Object.assign({
    texture: null,
    format: this.gl.RGB,
    smooth: true,
    mipmap: false,
    miplinear: false,
    aniso: this.maxAniso,
    crossOrigin: null,
    bbc: this.bbc
  }, item.options || {})

  const texture = item.texture || new Texture( this.gl, options.format )
  texture.bind()
  texture.setFilter( options.smooth, options.mipmap, options.miplinear )

  options.aniso = Math.min(this.maxAniso, options.aniso)
  if (options.aniso > 0) {
    this.gl.texParameterf( this.gl.TEXTURE_2D, this.extAniso.TEXTURE_MAX_ANISOTROPY_EXT, options.aniso )
  }

  if (this.DDSParser.isSupported() && item.compressed.dds && options.bbc) {
    Net.loadArrayBuffer(item.compressed.dds)
       .then((xhr) => xhr.response )
       .then( this.DDSParser.parse )
       .then( compressedTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else if (this.PVRParser.isSupported() && item.compressed.pvr && options.bbc) {
    Net.loadArrayBuffer(item.compressed.pvr)
       .then((xhr) => xhr.response )
       .then( this.PVRParser.parse )
       .then( compressedTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else if (this.KTXParser.isSupported() && item.compressed.ktx && options.bbc) {
    Net.loadArrayBuffer(item.compressed.ktx)
       .then((xhr) => xhr.response )
       .then( this.KTXParser.parse )
       .then( compressedTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else {
    loadImage( item.url ).then((function(image) {
      texture.fromImage(image)
      texture.setFilter(this.smooth, this.mipmap, this.miplinear)
      onFileLoaded( this.mipmap ? generateMipmap( texture ) : texture )
    }).bind(options))
  }

  return function() {}

}


/**
 * Cube texture loader function
 *
 * @param {Object} item
 * @param {Function} onFileLoaded
 * @param {Function} onFileError
 * @returns {Function}
 */
function CubeTextureLoader(item, onFileLoaded, onFileError) {

  const options = Object.assign({
    format: this.gl.RGB,
    smooth: true,
    mipmap: false,
    miplinear: false,
    aniso: this.maxAniso,
    crossOrigin: null,
    bbc: this.bbc,
    size: this.maxCubeSize
  }, item.options || {})

  const texture = new TextureCube( this.gl, options.format )
  texture.bind()
  texture.setFilter( options.smooth, options.mipmap, options.miplinear )

  // options.aniso = Math.min(this.maxAniso, options.aniso)
  // if (options.aniso > 0) {
  //   this.gl.texParameterf( this.gl.TEXTURE_2D, this.extAniso.TEXTURE_MAX_ANISOTROPY_EXT, options.aniso )
  // }

  if (this.DDSParser.isSupported() && item.compressed.dds && options.bbc) {
    Net.loadArrayBuffer(item.compressed.dds)
       .then((xhr) => xhr.response )
       .then( this.DDSParser.parse )
       .then( compressedCubeTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else if (this.PVRParser.isSupported() && item.compressed.pvr && options.bbc) {
    Net.loadArrayBuffer(item.compressed.pvr)
       .then((xhr) => xhr.response )
       .then( this.PVRParser.parse )
       .then( compressedCubeTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else if (this.KTXParser.isSupported() && item.compressed.ktx && options.bbc) {
    Net.loadArrayBuffer(item.compressed.ktx)
       .then((xhr) => xhr.response )
       .then( this.KTXParser.parse )
       .then( compressedCubeTexture( texture ) )
       .then( onFileLoaded )
       .catch( onFileError )
  }

  else {
    loadCubeImages(texture, item.urls).then( onFileLoaded )
                                      .catch( onFileError )
  }

  return function() {}

}





/**
 * Configure compressed texture
 *
 * @param {Texture} texture
 * @returns {Function}
 */
function compressedTexture( texture ) {
  return function( data ) {
    texture.bind()

    const mips   = data.surfaces[0]
    const format = data.format

    let width  = data.width
    let height = data.height

    texture.width  = width
    texture.height = height

    for (var i = 0, ilen = mips.length; i < ilen; i++) {
      texture.gl.compressedTexImage2D( texture.gl.TEXTURE_2D, i, format, width, height, 0, mips[i] )
      width  = Math.max( 1, width >> 1 )
      height = Math.max( 1, height >> 1 )
    }

    if (mips.length > 1) {
      texture.setFilter( true, true, true )
    }

    return texture
  }
}



function compressedCubeTexture( texture ){
  return function( data ){
    texture.bind()

    let mips, format, width, height

    for (var j = 0; j < data.surfaces.length; j++) {
      mips   = data.surfaces[j]
      format = data.format
      width  = data.width
      height = data.height

      texture.width  = width
      texture.height = height

      for (var i = 0; i < mips.length; i++) {
        texture.gl.compressedTexImage2D( faceForSurface( texture.gl, j ), i, format, width, height, 0, mips[i] );
        width  = Math.max( 1, width >> 1)
        height = Math.max( 1, height >> 1)
      }
    }

    // if( mips.length > 1){
    //   t.setFilter( true, true, false )
    // }

    return texture
  }
}


/**
 * Generate mip mapo
 *
 * @param {Texture} t
 * @returns {Texture}
 */
function generateMipmap( t ){
  t.bind()
  t.gl.generateMipmap( t.gl.TEXTURE_2D );
  return t;
}



/**
 * Get cube map face
 *
 * @param {GLContext} gl
 * @param {Integer} i
 * @returns
 */
function faceForSurface( gl, i ){
  switch( i ) {
    case 0: return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
    case 1: return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
    case 2: return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
    case 3: return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
    case 4: return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
    case 5: return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
    default : throw new Error( 'surface overflow' )
  }
}



/**
 * Load image
 *
 * @param {String} url
 * @returns
 */
function loadImage(url) {
  return when.promise(function(resolve, reject) {
    const image       = new Image
    image.crossOrigin = 'anonymous'
    image.onload      = function() {
      resolve(image)
    }
    image.onerror = reject
    image.src     = url
  })
}



/**
 * Load images and puts in the texture cube
 *
 * @param {TextureCube} textureCube
 * @param {String[]} urls
 * @returns
 */
function loadCubeImages( textureCube, urls ) {
  return when.map(urls, loadImage).then(function( images ) {
    textureCube.fromImages(images)
    return textureCube
  })
}