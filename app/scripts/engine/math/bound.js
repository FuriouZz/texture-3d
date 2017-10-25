'use strict'

const Rect = require('./rect')

/**
 *
 *
 * @class Bound
 * @extends {Rect}
 *
 */
class Bound extends Rect {

  /**
   * Creates an instance of Bound.
   *
   * @param {number} [x]
   * @param {number} [y]
   * @param {number} [width]
   * @param {number} [height]
   *
   * @memberof Bound
   */
  constructor(x, y, width, height) {
    super(x, y, width, height)

    this.constraint = {
      min: null,
      max: null
    }
  }

  get min() {
    return this.constraint.min
  }

  get max() {
    return this.constraint.max
  }

  update() {
    this.resize(this.x, this.y, this.width, this.height)
  }

  resize(x, y, width, height) {
    this.x = x
    this.y = y

    this.width  = width
    this.height = height

    this.applyConstraints()
  }

  applyConstraints() {
    if (this.max) {
      this.x = Math.min(this.x, this.max.x)
      this.y = Math.min(this.y, this.max.y)

      this.width  = Math.min(this.width, this.max.width)
      this.height = Math.min(this.height, this.max.height)
    }

    if (this.min) {
      this.x = Math.max(this.x, this.min.x)
      this.y = Math.max(this.y, this.min.y)

      this.width  = Math.max(this.width, this.min.width)
      this.height = Math.max(this.height, this.min.height)
    }
  }

  addConstraint(key, rect) {
    this.constraint[key] = new Rect(rect.x, rect.y, rect.width, rect.height)
  }

  removeConstraint(key) {
    this.constraint[key] = null
  }

}

module.exports = Bound