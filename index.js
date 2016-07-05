var _                    = require('lodash');
var webpack              = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var path                 = require('path');
var helpers              = require('./helpers.js');
var reacthelper          = require('./reactHelper.js');
var Reconfigure          = require('./reconfigure.js');

/**
* @param {String}  options.configFile                 - Path of the webpack.config.js file
* @param {String}  options.componentsPath             - Path where to look for components
* @param {Boolean} options.productionMode             - true for production mode
* @param {Boolean} [options.serverRender=false]       - true for server side rendering, the target div is always generated. NOTE: Currently SSR is provided with babel-register, which is not suitable for production environment
* @param {String}  [options.elementId   ="main"]      - The id of the div that will be created containing server side rendered html if enabled or empty (the node on which the React root component will be mounted)
* @param {Boolean} [options.generateEntry = true]     - whether or not to generate the entry point file
*/
module.exports = (function(options) {
    options               = options || {};
    var isProd            = options.productionMode ? options.productionMode : process.env.NODE_ENV == 'production';
    var stack             = [];
	
    //
    //  These are the internal middleware functions used
    //
    var renderMiddleware = reacthelper(options).renderMiddleware;


    if ( !isProd ) {
		// 
		// Generate the new configuration    	
		// 	
		var config = Reconfigure.generateConfig(options);
		
		
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

	
	    stack = [ wp, whmr, renderMiddleware ];
    }
    
    //
    // The public middleware
    //
	var repackMiddleware = function repackMiddleware(req, res, next) {
		if ( isProd ) {
			// we won't call webpack-middleware nor hot module replacement middleware in production,
			// only the middleware that adds res.renderReact
			return renderMiddleware(req, res, next);
		}

		var pos   = 0;
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


