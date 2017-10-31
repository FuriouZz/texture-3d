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

document.body.appendChild( $canvas )

module.exports = {
  imageData: null,

  create() {
    this.imageData = ctx.createImageData(64, 64)
  },

  set(index, value) {
    value = parseInt(value)
    this.imageData.data[index+0] = value
    this.imageData.data[index+1] = value
    this.imageData.data[index+2] = value
  },

  put() {
    ctx.putImageData( this.imageData, 0, 0 )
    this.imageData = null
  }
}