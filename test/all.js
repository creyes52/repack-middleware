var assert  = require('chai').assert;
var helpers = require('../helpers.js');
var fs      = require('fs');
var path        = require('path');
var _       = require('lodash');

var mkdir = function(path, cb) {
	fs.access(path, fs.F_OK, (err) => {
		if ( err ) 
			fs.mkdirSync(path);
		cb();
	});
}

describe('module', function() {

	describe('helpers.js', function() {

		var folderPath0= __dirname + "/../stub0";
		var folderPath1= __dirname + "/../node_modules/stub2";
		var folderPath2= __dirname + "/../stub1";
		var folderPath3= __dirname + "/../../stub3-1234567"; // just an improbable name

		before(function(cb) {
			mkdir(folderPath0, function() {
				mkdir(folderPath1, function() {
					mkdir(folderPath2, function() {
						mkdir(folderPath3, cb);
					});
				});
			});
		});

		it('should find a folder in the same location', function() {
			var pathstr = helpers.findModule('stub0');
			assert(pathstr, "found nothing");
			assert(pathstr.endsWith( path.join("repack-middleware", "stub0") ), "path is:" + pathstr);
		});
		it('should find a folder in the node modules', function() {
			var pathstr = helpers.findModule('stub2');
			//console.log(pathstr);
			assert(pathstr, "found nothing");
		});
		it('should find a folder in the above', function() {
			var pathstr = helpers.findModule('stub3-1234567');
			//console.log(pathstr);
			assert(pathstr, "found nothing");
		});
		it('should capture exceptions when folder does not exist', function() {
			helpers.bases.unshift("/unexisting");

			var path = helpers.findModule('unexisting/stub4');
			assert.isUndefined(path, "path is defined");
		});


		after(function(cb) {
			//return cb();
			fs.rmdir(folderPath0, function() {
				fs.rmdir(folderPath1, function() {
					fs.rmdir(folderPath2, function() {
						fs.rmdir(folderPath3, cb);
					});
				});
			});
		});

	});

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
