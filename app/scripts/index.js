'use strict'

const Renderer = require('./engine/core/renderer')
const Scene    = require('./scene')
const GLState  = require('nanogl-state')

const renderer = new Renderer(document.querySelector('canvas'))
renderer.play()
renderer.updateSize()

renderer.gl.state = new GLState( renderer.gl )

const scene = new Scene( renderer )
scene.activate()


// require('./debug/canvas')()