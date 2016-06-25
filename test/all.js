var assert  = require('chai').assert;
var helpers = require('../helpers.js');
var fs      = require('fs');
var path        = require('path');
var reactHelper = require('../reactHelper')({
	componentsPath: __dirname + "/stubs",
	isProd: false
});

var mkdir = function(path, cb) {
	fs.access(path, fs.F_OK, (err) => {
		if ( err ) 
			fs.mkdirSync(path);
		cb();
	});
}

describe('module', function() {

	describe('find', function() {

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

	describe('reactRender', function() {
		it('should render a simple component', function(cb) {
			reactHelper.renderFn('Simple', {}, null, function(err, html) {
				//console.log("err", err, "html", html);
				assert(html);
				cb();
			});
		});

		it('should render a route configuration', function(cb) {
			var req = {
				url: "/"
			};
			reactHelper.renderFn('reactContext', {}, req, function(err, html) {
				//console.log("err", err, "html", html);
				assert(html);
				cb();
			});
		});
	});
	
});
