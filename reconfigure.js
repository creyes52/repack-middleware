'use strict'
var _                    = require('lodash');
var webpack              = require('webpack');
var path                 = require('path');
var reacthelper          = require('./reactHelper.js');

/**
*  This module creates a new configuration for webpack,
*  Adds hot module replacement entry, source maps, react and react-dom as externals
*/
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
			externals: {},
			module: {}
		};

		if ( this.isProd ) 
			delete defaultConfig.devtool;

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

		if ( !config.entry  ) {
			config.entry = newEntry;
		} else if ( Array.isArray( config.entry) ) {
			config.entry = addHmr( config.entry );
		} else if ( typeof config.entry == 'object' ) {
			config.entry = _.mapValues( config.entry, addHmr );
		} else {
			config.entry = addHmr ( config.entry );
		}

		return config;
	}

	addReact( config, options ) {
		options = options || {};
		var config = _.cloneDeep ( config );
		var externals = options.externals === undefined ? false : options.externals;
		var react     = options.react     === undefined ? false : options.react;
		var reactDom  = options.reactDom  === undefined ? false : options.reactDom;
		var noparse   = options.noparse   === undefined ? false : options.noparse;

		if ( externals ) {
			config.externals['react-dom'] = 'ReactDOM';
			config.externals['react']     = 'React';
		}
		var testExpr = /.*dist.*\.js$/;
		//testExpr = /.*\.min\.js$/;

		if ( noparse ) {
			config.noParse                = testExpr;

			config.module.loaders = config.module.loaders || [];
			config.module.loaders.push({
				test  : testExpr,
				loader: "imports?define=>false,exports=>false"
			});
		}

		if ( reactDom ) {
			//var reactDomPath = require.resolve('react-dom/dist/react-dom.min.js');
			var reactDomPath = require.resolve('react-dom/dist/react-dom.js');
			config = this.prependEntry( config, reactDomPath );
		}
		if ( react ) {
			//var reactPath = require.resolve('react/dist/react.min.js');
			var reactPath = require.resolve('react/dist/react.js');
			config = this.prependEntry( config, reactPath );
		}
			
		return config;

	}

	addLoaders ( config ) {
		var config = _.cloneDeep ( config );

		if ( typeof config.module != "object" ) config.module = {};
		if ( !Array.isArray(config.module.loaders)) config.module.loaders = [];

		config.module.loaders = config.module.loaders || [];
		config.module.loaders.push({
			test: /\.jsx$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['babel-preset-react', 'babel-preset-es2015'].map(require.resolve)
			}
		});

		return config;
	}

	addHmrMiddleware ( config ) {
		var config = _.cloneDeep ( config );

		if ( !Array.isArray(config.plugins) ) {
			config.plugins = [];
		}
		
		// add HMR plugin (server side)
		config.plugins.unshift(
			//new webpack.optimize.OccurenceOrderPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin()
		);

		// add HRM entry point (client side)
		var hmrPath = require.resolve('webpack-hot-middleware/client.js');
		config = this.prependEntry ( config, hmrPath );

		return config;
	}

	addUglify( config ) {
		var config = _.cloneDeep( config );
		
		if ( !Array.isArray(config.plugins) ) {
			config.plugins = [];
		}

		config.plugins.push(new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}));

		config.plugins.push(new webpack.DefinePlugin({
		    'process.env': {
		      'NODE_ENV': JSON.stringify('production')
		    }
		}));

		return config;

	}

}

Reconfigure.generateConfig = function(options) {
	var isProd            = options.productionMode ? options.productionMode : process.env.NODE_ENV == 'production';

	// 
	// Generate the new configuration    	
	// 	
	
	var reconfigure = new Reconfigure( options );
	var config      = reconfigure.addDefaultConfiguration();

	if ( isProd ) {
		config      = reconfigure.addUglify( config );
	} else {
		config      = reconfigure.addHmrMiddleware( config );
	}

	// adding babel loaders
	config = reconfigure.addLoaders( config );
	
	// adding generated entry point 
	if ( options.generateEntry ) {
		var entryFile   = reacthelper(options).createEntryScript( options.componentsPath );
		config          = reconfigure.prependEntry(config, entryFile);
	}

	//
	// adding libraries
	//
	var defaultInternals = {
		externals: false,
		noparse: false,
		react: false,
		reactDom: false
	};
	var internalOptions = options.internals || defaultInternals;
	config              = reconfigure.addReact ( config, internalOptions);

	// debuging	
	//console.log("webpack config:", config);
	//console.log("loaders:", config.module.loaders[1].query.presets);

	return config;
}

module.exports = Reconfigure;

