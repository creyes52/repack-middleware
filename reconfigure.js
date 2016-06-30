'use strict'
/**
*  This module creates a new configuration for webpack,
*  Adds hot module replacement entry, source maps, react and react-dom as externals
*/


var _                    = require('lodash');
var webpack              = require('webpack');

class Reconfigure {

	constructor( options ) {
    	options               = options || {};
		this.webpackConfigFile = options.configFile || "";
		this.componentsPath    = options.componentsPath || "";
		this.isProd            = options.productionMode ? options.productionMode : process.env.NODE_ENV == 'prod';
		this.webpackConfig     = require(this.webpackConfigFile);
	}

	addDefaultConfiguration () {
		//
		// ======== the default configuration =======
		//
		var defaultConfig = {
			output: {
				path: "/",
				publicPath: "/" // used to prefix json updates
			},
			devtool: 'source-map',
			plugins: [],
			externals: {
				// "node/npm module name" : "name of exported library variable"
				'react': 'React',
				'react-dom': 'ReactDOM'
			},
			module: {
				noParse: /.*\.min\.js$/
			}
		};


		var original = _.cloneDeep ( this.webpackConfig );
		return _.defaultsDeep( {}, original, defaultConfig );
	}

	/**
	* Prepends a new main to every entry in the config
	*/
	prependEntry( config, newEntry ) {

		var config = _.cloneDeep( config );

		var addHmr = function( entry ) {
			if ( typeof entry == 'string' ) {
				entry = [ entry ];
			}
			entry = [ newEntry ].concat ( entry );
			return entry;
		}


		if ( Array.isArray( config.entry) ) {
			config.entry = addHmr( config.entry );
		} else if ( typeof config.entry == 'object' ) {
			config.entry = _.mapValues( config.entry, addHmr );
		} else {
			config.entry = addHmr ( config.entry );
		}

		return config;
	}

	addReact( config ) {
		var config = _.cloneDeep ( config );

		var hmrPath = require.resolve('webpack-hot-middleware/client.js');
		//var hmrPath = helpers.findModule('webpack-hot-middleware');
		//hmrPath = hmrPath + "/client.js";
		//var hmrPath = __dirname + '/node_modules/webpack-hot-middleware/client.js';
		//hmrPath = "webpack-hot-middleware/client";
		config = this.prependEntry ( config, hmrPath );

		var reactRuntime = require.resolve('react/dist/react.min.js');
		config = this.prependEntry( config, reactRuntime );

		var reactDom = require.resolve('react-dom/dist/react-dom.min.js');
		config = this.prependEntry( config, reactDom );

		return config;

	}

	addHmrMiddleware ( config ) {
		var config = _.cloneDeep ( config );

		if ( !Array.isArray(config.plugins) ) {
			config.plugins = [];
		}
		
		config.plugins.unshift(
			new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin()
		);

		return config;
	}

}

module.exports = Reconfigure;

