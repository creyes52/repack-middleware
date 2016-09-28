var assert  = require('chai').assert;
var fs      = require('fs');
var path    = require('path');
var _       = require('lodash');

var mkdir = function(path, cb) {
	fs.access(path, fs.F_OK, (err) => {
		if ( err ) 
			fs.mkdirSync(path);
		cb();
	});
}

describe('module', function() {

	describe('reconfigure.js', function() {
		var instance = null;
		var Reconfigure = require('../reconfigure.js');

		beforeEach(function() {
			instance = new Reconfigure({
				configFile: './test/stubs/webpack.config.js',
				isProd: false 
			});
		});

		it('should create a default configuration', function() {
			var config = instance.addDefaultConfiguration();
		
			assert( config.output.path == './test/test-build/', 'output.path was incorrect');
			assert( config.output.filename == 'app.bundle.js' , 'output.filename was incorrect');
		});

		it('should not override properties already defined', function() {
			var config = instance.addDefaultConfiguration();

			assert( config.output.publicPath, '/build/');
			
		});

		it('should be able to prepend into array when string', function() {
			var config1 = {
				entry: 'file1.js'
			};
			var config2 = {
				entry: [ 'prepend.js', 'file1.js' ]
			}

			var result = instance.prependEntry ( config1, 'prepend.js' );
			assert.deepEqual( result, config2, "prepend did not convert correctly");

		});

		it('should be able to prepend into array when already array', function() {
			var config1 = {
				entry: [ 'file1.js' ]
			};
			var config2 = {
				entry: [ 'prepend.js', 'file1.js' ]
			}

			var result = instance.prependEntry ( config1, 'prepend.js' );
			assert.deepEqual( result, config2, "prepend did not convert correctly");

		});
		
		it('should be able to prepend into array when object', function() {
			var config1 = {
				entry: {
					'main': 'main.entry.js',
					'second': 'second.entry.js'
				}
			};
			var config2 = {
				entry: {
					'main'  : ['prepend.js', 'main.entry.js' ],
					'second': ['prepend.js', 'second.entry.js' ]
				}
			}

			var result = instance.prependEntry ( config1, 'prepend.js' );
			assert.deepEqual( result, config2, "prepend did not convert correctly");

		});

		it('should add the react min and react dom min', function() {
			var config1 = {
				entry: "entry.js"
			};
			var testReactDom = /.*node_modules.*react-dom\.min\.js/;
			var testReact    = /.*node_modules.*react\.min\.js/;
			
			var result = instance.addReact( config1 );

			assert( Array.isArray( result.entry ), "entry is not array");

			assert( 
				result.entry.reduce( (prev, val) => val = val || testReactDom.test(val), false),
				"react dom min was not added" + result.entry  
			);
			assert( 
				result.entry.reduce( (prev, val) => val = val || testReac.test(val), false),
				"react min was not added" + result.entry  
			);
		});

		it('should add the needed plugins', function() {
			var config = {
			};

			var result = instance.addHmrMiddleware( config );

			assert( Array.isArray( result.plugins ));
			assert.isAtLeast( 3, result.plugins.length, "should have 3 plugins");
		});

	});

	
});
