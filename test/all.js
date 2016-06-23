var assert  = require('chai').assert;
var helpers = require('../helpers.js');
var fs = require('fs');

var mkdir = function(path, cb) {
	fs.access(path, fs.F_OK, (err) => {
		if ( err ) 
			fs.mkdirSync(path);
		cb();
	});
}

describe('module', function() {

	describe('find', function() {

		var folderPath1= __dirname + "/../node_modules/stub2";
		var folderPath2= __dirname + "/../stub1";
		var folderPath3= __dirname + "/../../stub3-1234567"; // just an improbable name

		before(function(cb) {
			mkdir(folderPath1, function() {
				mkdir(folderPath2, function() {
					mkdir(folderPath3, cb);
				});
			});
		});

		it('should find a folder in the same location', function() {
			var path = helpers.findModule('stub1');
			assert(path, "found nothing");
			assert(path.endsWith("repack-middleware/stub1"));
		});
		it('should find a folder in the node modules', function() {
			var path = helpers.findModule('stub2');
			//console.log(path);
			assert(path, "found nothing");
		});
		it('should find a folder in the above', function() {
			var path = helpers.findModule('stub3-1234567');
			//console.log(path);
			assert(path, "found nothing");
		});
		it('should capture exceptions when folder does not exist', function() {
			helpers.bases.unshift("/unexisting");

			var path = helpers.findModule('unexisting/stub4');
			assert.isUndefined(path, "path is defined");
		});


		after(function(cb) {
			fs.rmdir(folderPath1, function() {
				fs.rmdir(folderPath2, function() {
					fs.rmdir(folderPath3, cb);
				});
			});
		});

	});
	
});
