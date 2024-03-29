'use strict'

module.exports = function Application() {

  this.configure.add('application:initialize', function() {

    this.assets.LOAD_PATH = './app'
    this.assets.DST_PATH = './public'
    this.assets.KEEP_MANIFEST_FILE = true
    this.assets.cacheable = false
    this.assets.debug = true

    this.config.i18n.default_locale = 'en'
    this.config.i18n.locales.push('en', 'fr')
    this.config.i18n.load_path.push(
      this.root + '/config/locales'
    )

    this.assets.add( 'assets' )
    this.assets.symlink( 'assets' )

    this.entry( 'scripts/index.js'       , 'main.js'    )
    this.entry( 'scripts/vendor/index.js', 'vendor.js'  )
    this.entry( 'styles/index.styl'      , 'main.css'   )
    this.entry( 'views/index.html.ejs'   , 'index.html' )

  })

  this.module(require('../workflow/modules/assets.js'))
  this.module(require('../workflow/modules/git.js'))
  this.module(require('../workflow/modules/webpack.js'))
  this.module(require('../workflow/modules/i18n.js'))

}