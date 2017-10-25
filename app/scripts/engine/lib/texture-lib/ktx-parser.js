//
//  KTX Parser
//  Author: pierre lepers
//  Date: 17/09/2014 11:09
//


var MAGIC = new Uint8Array( [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A] );

function CheckMagic( f ){
  for (var i = 0; i < 12; i++) {
    if( f[i] !== MAGIC[i] ) return false;
  }
  return true;
}



function Parser( gl ){
  this.ext = gl.getExtension( 'WEBGL_compressed_texture_etc1' ) || gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_etc1' );

  var scope = this;
  this.parse = function( b ){
    return scope._parse( b );
  }
}


Parser.prototype = {

  isSupported : function(){
    return !!this.ext;
  },

  _parse : function( buffer ) {
    var magic = new Uint8Array( buffer, 0, 12 );
    if( ! CheckMagic( magic ) )  {
      throw new Error( "[KTXParser] Bad Magic" );
    }

    var headerLength = 64; // bytes
    var buffer = new DataView( buffer );

    var lendian = ( buffer.getUint32( 12, true ) === 0x04030201 );

    var ptr = 16;

    var glType                = buffer.getUint32( ptr, lendian ); ptr+=4;
    var glTypeSize            = buffer.getUint32( ptr, lendian ); ptr+=4;
    var glFormat              = buffer.getUint32( ptr, lendian ); ptr+=4;
    var glInternalFormat      = buffer.getUint32( ptr, lendian ); ptr+=4;
    var glBaseInternalFormat  = buffer.getUint32( ptr, lendian ); ptr+=4;
    var pixelWidth            = buffer.getUint32( ptr, lendian ); ptr+=4;
    var pixelHeight           = buffer.getUint32( ptr, lendian ); ptr+=4;
    var pixelDepth            = buffer.getUint32( ptr, lendian ); ptr+=4;
    var numberOfArrayElements = buffer.getUint32( ptr, lendian ); ptr+=4;
    var numberOfFaces         = buffer.getUint32( ptr, lendian ); ptr+=4;
    var numberOfMipmapLevels  = buffer.getUint32( ptr, lendian ); ptr+=4;
    var bytesOfKeyValueData   = buffer.getUint32( ptr, lendian ); ptr+=4;


    if( glInternalFormat !== this.ext.COMPRESSED_RGB_ETC1_WEBGL ){
      throw new Error( 'KTX unsupported internal format '+glInternalFormat +'. Must be COMPRESSED_RGB_ETC1_WEBGL' );
    }

    // skip KeyValueData
    ptr += bytesOfKeyValueData;


    var numMips  = (numberOfMipmapLevels  > 0 ) ? numberOfMipmapLevels  : 1;
    var numSurfs = (numberOfArrayElements > 0 ) ? numberOfArrayElements : 1;
    var numFaces = (numberOfFaces         > 0 ) ? numberOfFaces         : 1;
    var pixDepth = (pixelDepth            > 0 ) ? pixelDepth            : 1;



    var surfaces = [];

    for ( var faceIndex = 0; faceIndex < numFaces; faceIndex++  ) {
      surfaces.push([]);
    }

    for (var i = 0; i < numMips; i++) {
      var imageSize = buffer.getUint32( ptr, lendian ); ptr+=4;

      var imageSizeRounded = imageSize & ~3;
      console.log( numFaces, numSurfs, imageSize, imageSizeRounded )

      for (var surfIndex = 0; surfIndex < numSurfs; surfIndex++) {

        for (var faceIndex = 0; faceIndex < numFaces; faceIndex++ ) {

          var byteArray = new Uint8Array( buffer.buffer, ptr, imageSizeRounded );
          ptr += imageSizeRounded;//3 - ((imageSize + 3) % 4);
          surfaces[faceIndex].push( byteArray );

        }

      }

      // mip padding
    }

    // console.log( 'glType                : '+glType                );
    // console.log( 'glTypeSize            : '+glTypeSize            );
    // console.log( 'glFormat              : '+glFormat              );
    // console.log( 'glInternalFormat      : '+glInternalFormat      );
    // console.log( 'glBaseInternalFormat  : '+glBaseInternalFormat  );
    // console.log( 'pixelWidth            : '+pixelWidth            );
    // console.log( 'pixelHeight           : '+pixelHeight           );
    // console.log( 'pixelDepth            : '+pixelDepth            );
    // console.log( 'numberOfArrayElements : '+numberOfArrayElements );
    // console.log( 'numberOfFaces         : '+numberOfFaces         );
    // console.log( 'numberOfMipmapLevels  : '+numberOfMipmapLevels  );
    // console.log( 'bytesOfKeyValueData   : '+bytesOfKeyValueData   );



    return {
      width   : pixelWidth,
      height  : pixelHeight,
      surfaces: surfaces,
      format  : glInternalFormat,
      cubemap : false
    };

  },

  _getFormat : function( fid ){

    switch( fid ){
      case RGB_PVRTC_4BPPV1_Format  :
        return this.ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG
      case RGB_PVRTC_2BPPV1_Format  :
        return this.ext.COMPRESSED_RGB_PVRTC_2BPPV1_IMG
      case RGBA_PVRTC_4BPPV1_Format :
        return this.ext.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG
      case RGBA_PVRTC_2BPPV1_Format :
        return this.ext.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
      default :
        throw new Error( "[PVRLoader] Unknown pixel format" );
    }

  },

  _extract : function( header ) {

    var surfaces = [];

    var format = this._getFormat( header.format );

    var pvr = {
      width    : header.width,
      height   : header.height,
      surfaces : surfaces,
      format   : format,
      cubemap  : header.isCubemap
    };

    var buffer = header.buffer;



    // console.log( "--------------------------" );

    // console.log( "headerLength ", headerLength);
    // console.log( "height       ", height      );
    // console.log( "width        ", width       );
    // console.log( "numMipmaps   ", numMipmaps  );
    // console.log( "flags        ", flags       );
    // console.log( "dataLength   ", dataLength  );
    // console.log( "bpp          ", bpp         );
    // console.log( "bitmaskRed   ", bitmaskRed  );
    // console.log( "bitmaskGreen ", bitmaskGreen);
    // console.log( "bitmaskBlue  ", bitmaskBlue );
    // console.log( "bitmaskAlpha ", bitmaskAlpha);
    // console.log( "pvrTag       ", pvrTag      );
    // console.log( "numSurfs     ", numSurfs    );




    var dataOffset    = header.dataPtr,
        bpp           = header.bpp,
        numSurfs      = header.numSurfaces,
        dataSize      = 0,
        blockSize     = 0,
        blockWidth    = 0,
        blockHeight   = 0,
        widthBlocks   = 0,
        heightBlocks  = 0;


    for ( var surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {
      surfaces.push([]);
    }


    if( bpp === 2 ){
      blockWidth = 8;
      blockHeight = 4;
    } else {
      blockWidth = 4;
      blockHeight = 4;
    }

    blockSize = (blockWidth * blockHeight) * bpp / 8;

    var mipLevel = 0;

    while (mipLevel < header.numMipmaps) {

      var sWidth = header.width >> mipLevel,
      sHeight = header.height >> mipLevel;

      widthBlocks = sWidth / blockWidth;
      heightBlocks = sHeight / blockHeight;

      // Clamp to minimum number of blocks
      if (widthBlocks < 2)
        widthBlocks = 2;
      if (heightBlocks < 2)
        heightBlocks = 2;

      dataSize = widthBlocks * heightBlocks * blockSize;


      for ( var surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {

        var byteArray = new Uint8Array( buffer, dataOffset, dataSize );
        surfaces[surfIndex].push( byteArray );
        dataOffset += dataSize;

      }

      mipLevel++;

    }



  }


}


function _parseV3( pvrDatas ) {

  var header = pvrDatas.header;
  var bpp, format;


  var metaLen     = header[12],
    pixelFormat   =  header[2],
    height        =  header[6],
    width         =  header[7],
    numSurfs      =  header[9],
    numFaces      =  header[10],
    numMipmaps    =  header[11];

  switch( pixelFormat ) {
    case 0 : // PVRTC 2bpp RGB
      bpp = 2;
      format = RGB_PVRTC_2BPPV1_Format;
      break;
    case 1 : // PVRTC 2bpp RGBA
      bpp = 2
      format = RGBA_PVRTC_2BPPV1_Format;
      break;
    case 2 : // PVRTC 4bpp RGB
      bpp = 4
      format = RGB_PVRTC_4BPPV1_Format;
      break;
    case 3 : // PVRTC 4bpp RGBA
      bpp = 4
      format = RGBA_PVRTC_4BPPV1_Format;
      break;
    default :
      throw new Error( "pvrtc - unsupported PVR format "+pixelFormat);
  }

  pvrDatas.dataPtr     = 52 + metaLen;
  pvrDatas.bpp         = bpp;
  pvrDatas.format      = format;
  pvrDatas.width       = width;
  pvrDatas.height      = height;
  pvrDatas.numSurfaces = numFaces;
  pvrDatas.numMipmaps  = numMipmaps;
  pvrDatas.isCubemap   = (numFaces === 6);

  return pvrDatas;
};


function _parseV2 ( pvrDatas ) {

  var header = pvrDatas.header;

  var headerLength  =  header[0],
    height        =  header[1],
    width         =  header[2],
    numMipmaps    =  header[3],
    flags         =  header[4],
    dataLength    =  header[5],
    bpp           =  header[6],
    bitmaskRed    =  header[7],
    bitmaskGreen  =  header[8],
    bitmaskBlue   =  header[9],
    bitmaskAlpha  =  header[10],
    pvrTag        =  header[11],
    numSurfs      =  header[12];


  var TYPE_MASK = 0xff
  var PVRTC_2 = 24,
    PVRTC_4 = 25

  var formatFlags = flags & TYPE_MASK;



  var format;
  var _hasAlpha = bitmaskAlpha > 0;

  if (formatFlags === PVRTC_4 ) {
    format = _hasAlpha ? RGBA_PVRTC_4BPPV1_Format : RGB_PVRTC_4BPPV1_Format;
    bpp = 4;
  }
  else if( formatFlags === PVRTC_2) {
    format = _hasAlpha ? RGBA_PVRTC_2BPPV1_Format : RGB_PVRTC_2BPPV1_Format;
    bpp = 2;
  }
  else
    throw new Error( "pvrtc - unknown format "+formatFlags);



  pvrDatas.dataPtr     = headerLength;
  pvrDatas.bpp         = bpp;
  pvrDatas.format      = format;
  pvrDatas.width       = width;
  pvrDatas.height      = height;
  pvrDatas.numSurfaces = numSurfs;
  pvrDatas.numMipmaps  = numMipmaps + 1;

  // guess cubemap type seems tricky in v2
  // it juste a pvr containing 6 surface (no explicit cubemap type)
  pvrDatas.isCubemap  = (numSurfs === 6);

  return pvrDatas;

};




module.exports = Parser;