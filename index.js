var _                    = require('lodash');
var webpack              = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var path                 = require('path');
var helpers              = require('./helpers.js');
var reacthelper          = require('./reactHelper.js');
var Reconfigure          = require('./reconfigure.js');

/**
* options.configFile {String} - Path of the webpack.config.js file
* options.componentsPath {String} - Path where to look for components
* options.productionMode {Boolean} - true for production mode
* options.serverRender {Boolean} - true to generate rendered html on the server, false will just insert the main element
* options.elementId {String} - The id of the div that will be created containing server side rendered html if enabled or empty (the node on which the React root component will be mounted)
*/
module.exports = (function(options) {
    options               = options || {};
    var isProd            = options.productionMode ? options.productionMode : process.env.NODE_ENV == 'prod';
	
	// 
	// Generate the new configuration    	
	// 	
	
	var reconfigure = new Reconfigure( options );
	var config      = reconfigure.addDefaultConfiguration();
	config          = reconfigure.addHmrMiddleware( config );
	
	// adding generated entry point 
	var entryFile   = reacthelper(options).createEntryScript( options.componentsPath );
	config          = reconfigure.prependEntry(config, entryFile);
	
	// adding libraries
	config = reconfigure.addReact ( config, options.internals || {
		hmr: (isProd) ? false : true,
		externals: true,
		noparse: true,
		react: true,
		reactDom: true
	});
	//console.log("webpack config:", config);
	//console.log("loaders:", config.module.loaders[1].query.presets);


    //
    // ======= webpack middleware and hmr middleware ====
    //
    var compiler = webpack( config );
    var wp       = webpackDevMiddleware( compiler, {
        publicPath: config.output.publicPath , // public path where bundle and json is actually served
        stats: {
            colors: true,
        },
        noInfo: true,
        watchOptions:{
            poll: true
        }
    });
    var whmr             = webpackHotMiddleware(compiler);

    
    //
    //  These are the internal middleware functions used
    //
    var renderMiddleware = reacthelper(options).renderMiddleware;
    
    //
    // The public middleware
    //
	var repackMiddleware = function repackMiddleware(req, res, next) {
		var stack = [ wp, whmr, renderMiddleware];
		var pos   = 0;

		if ( isProd ) {
			// we won't call webpack-middleware nor hot module replacement middleware in production,
			// only the middleware that adds res.renderReact
			return renderMiddleware(req, res, next);
		}

		var theNext = function() {
			if ( pos < stack.length ) {
				stack[pos++](req, res, theNext);
			} else {
				next();
			}
		};
		theNext();
	}


	return repackMiddleware;
});


