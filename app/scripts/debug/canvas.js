'use strict'

const D = require('./data')

module.exports = function() {

  var $canvas = document.createElement('canvas');
  var ctx = $canvas.getContext('2d');

  $canvas.width  = 64 * 8
  $canvas.height = 64 * 8
  $canvas.style.cssText = `
    width: ${64*8}px;
    height: ${64*8}px;
    position: absolute;
    z-index: 1000;
  `

  ctx.fillStyle = 'green';
  ctx.fillRect(10, 10, 100, 100);

  let offset = 0
  let image_data

  console.log(D)

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {

      image_data = ctx.getImageData(x * 64, y * 64, 64, 64)
      offset = (x * 8 + y) * 64

      // for (let i = offset, j = offset, ilen = offset + 64 * 64 * 4; i < ilen; i+=4, j++) {
      // for (let i = 0, j = offset, ilen = 64 * 64 * 4; i < ilen; i+=4, j++) {
      //   image_data.data[i+0] = image_data.data[i+1] = image_data.data[i+2] = D[j]
      //   image_data.data[i+3] = 255
      // }

      let j = 0

      for (let sy = 0, dy = 0; sy < 64 * 4; sy+=4, dy++) {
        for (let sx = 0, dx = 0; sx < 64 * 4; sx+=4, dx++) {
          const i = sx * 64 + sy
          j = 0.0 + dy * 64 + dx * 64 * 64
          image_data.data[i+0] = image_data.data[i+1] = image_data.data[i+2] = 255 * (sx / (64 * 4))
        }
      }

      console.log(x * 64, y * 64)

      ctx.putImageData( image_data, x * 64, y * 64 )
    }
  }

  document.body.appendChild( $canvas )

}