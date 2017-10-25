module.exports = {
  Core: {
    Geometry: require('./core/geometry'),
    Material: require('./core/material'),
    Mesh: require('./core/mesh'),
    Renderer: require('./core/renderer')
  },

  MovieClip: require('./2d/movie-clip'),
  Sprite: require('./2d/sprite'),

  TextureLib: require('./lib/texture-lib/texture-lib'),
  Net: require('./lib/net'),
  Sequence: require('./lib/sequence'),

  Materials: {
    Basic: require('./materials/basic/basic'),
    MovieClip: require('./materials/movie-clip/movie-clip'),
    Sprite: require('./materials/sprite/sprite')
  },

  Math: {
    Rect: require('./math/rect'),
    Bound: require('./math/bound')
  },

  Entities: {
    Cube: require('./entities/cube'),
    Plane: require('./entities/plane')
  },

  Geometries: {
    Box: require('./geometries/box')
  },

  utils: {
    color: require('./utils/color'),
    gl: require('./utils/gl')
  }
}