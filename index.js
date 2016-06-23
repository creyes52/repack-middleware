var React          = require('react');
var ReactDOMServer = require('react-dom/server');
var components = {};
var _                    = require('lodash');
var webpack              = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var path                 = require('path');
var helpers              = require('./helpers.js');
require('babel-register');
	



module.exports = (function(options) {
    options               = options || {};
    var webpackConfigFile = options.configFile || "";
    var componentsPath    = options.componentsPath || "";
    var isProd            = options.productionMode ? options.productionMode : process.env.NODE_ENV == 'prod';
    
    var webpackConfig     = require(webpackConfigFile);

    var renderFn = function(componentName, vars) {
        try {
        var component = components[componentName];
        if ( component == undefined ) {
            var compPath  = path.join(componentsPath, `${componentName}.jsx`);
            var compCtor  = require( compPath ).default;
            component = React.createFactory( compCtor );
            if ( isProd ) {
                components[componentName] = component; 
            }
        }

        var element = component(vars);
        return ReactDOMServer.renderToString( element );
        } catch(err) {
            console.error(err);
        }
    }

    var renderMiddleware = function renderMiddleware(req, res, next) {
        res.renderReact = function(component, vars) {
            var html = "";
            html += `<div id='main'>${renderFn( component, vars)}</div>`;
            html += `<script type='text/javascript'>var INIT = ${JSON.stringify(vars)}</script>`;
            res.locals.reactHtml = html;
            //return res.view();
			return html;
        }
        next();
    }

    var nullMiddleware = function nullMiddleware(req, res, next) {
        next();
    }

    /**
    * Configuring webpack middleware
    * This middleware, and the HMR (hot module replacement) are only used in develpment
    *
    */
    
    //
    // ======== reconfigure configuration =======
    //
    var config = _.defaultsDeep({}, webpackConfig, {
        output: {
            path: "/",
            publicPath: "/build/" // used to prefix json updates
        },
        devtool: 'source-map',
        plugins: []
    });

    //
    //  ========== HMR configuration ======
    //
    if ( typeof config.entry == 'string' ) {
        config.entry = [ config.entry ];
    }
	var hmrPath = helpers.findModule('webpack-hot-middleware');
	hmrPath = hmrPath + "/client.js";
	//var hmrPath = __dirname + '/node_modules/webpack-hot-middleware/client.js';
	//hmrPath = "webpack-hot-middleware/client";
    

	var addHmr = function( entry ) { entry.unshift( hmrPath ); }
    if ( typeof config.entry.length == 'number' ) {
        addHmr( config.entry );
    }
    else if ( typeof config.entry == 'object' ) {
        _.values( config.entry ).forEach( addHmr );
    } 

    config.plugins.unshift(
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    );

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

    var whmr = webpackHotMiddleware(compiler);

	var repackMiddleware = function repackMiddleware(req, res, next) {
		var stack = [ wp, whmr, renderMiddleware];
		var pos   = 0;

		if ( isProd ) {
			// we won't call webpack-middleware nor hot module replacement middleware in production
			stack = [ renderMiddleware ];
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


