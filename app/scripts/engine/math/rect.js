'use strict'

/**
 *
 *
 * @class Rect
 */
class Rect {

  /**
   * Creates an instance of Rect.
   *
   * @param {number} [x]
   * @param {number} [y]
   * @param {number} [width]
   * @param {number} [height]
   *
   * @memberof Rect
   */
  constructor(x, y, width, height) {
    this.x = isNaN(x) ? 0 : x
    this.y = isNaN(y) ? 0 : y

    this.width  = isNaN(width)  ? 0 : width
    this.height = isNaN(height) ? 0 : height
  }

  get top() {
    return this.y - this.height * 0.5
  }

  get left() {
    return this.x - this.width  * 0.5
  }

  get right() {
    return this.x + this.width  * 0.5
  }

  get bottom() {
    return this.y + this.height * 0.5
  }

  inside(x, y) {
    return this.insideX(x) && this.insideY(y)
  }

  insideX(x) {
    return x > this.left && x < this.right
  }

  insideY(y) {
    return y > this.top && y < this.bottom
  }

  outside(x, y) {
    return !this.inside(x, y)
  }

  outsideX(x) {
    return !this.insideX(x)
  }

  outsideY(y) {
    return !this.insideY(y)
  }

}

module.exports = Rect