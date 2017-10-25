'use strict'

const { Program } = require('nanogl')
const { getPrecision } = require('../utils/gl')

class Material {


  constructor(gl) {
    this.gl = gl

    this.program = null
    this.defs = ''
    this.vertexShader = null
    this.fragmentShader = null

    this.defs = 'precision ' + getPrecision( this.gl ) + ' float;\n'
  }

  /**
   * Compile program
   *
   *
   * @memberof Material
   */
  compile() {
    this.program = new Program(this.gl)
    this.program.compile(this.vertexShader, this.fragmentShader, this.defs)
  }

  /**
   * Prepare program
   *
   *
   * @memberof Material
   */
  prepare() {
    this.program.use()
  }

  /**
   * Set uniform
   *
   * @param {string} key
   * @param {*} value
   *
   * @memberof Material
   */
  uniform(key, value) {
    if (this.program[key]) this.program[key]( value )
  }

  /**
   * Material#uniform alias
   *
   * @param {string} key
   * @param {*} value
   *
   * @memberof Material
   */
  u(key, value) {
    this.uniform(key, value)
  }

}

module.exports = Material