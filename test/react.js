var assert  = require('chai').assert;
var fs      = require('fs');
var path        = require('path');
var _       = require('lodash');
var reactHelper = require('../reactHelper')({
	componentsPath: __dirname + "/stubs",
	configFile: './test/stubs/webpack.config.js',
	isProd: false
});


describe('reactHelper.js', function() {

	describe('renderfn', function() {

		xit('should render a simple component', function(cb) {
			reactHelper.renderFn('Simple', {}, null, function(err, html) {
				assert.isDefined(html, "html generated was incorrect");
				cb();
			});
		});

		xit('should render a route configuration', function(cb) {
			var req = {
				url: "/"
			};
			reactHelper.renderFn('reactContext', {}, req, function(err, html) {
				assert.isDefined(html, "html generated was incorrect");
				cb();
			});
		});

	});

	describe('createBundle', function() {
		xit('should compile a component, given the default configuration', function(cb) {
		this.timeout(9000);
			reactHelper.createBundle(cb, false, true);
		});

	});

	describe('createEntryScript', function() {

		it('should generate a file', function(cb) {
			var filePath = reactHelper.createEntryScript(__dirname+"/stubs");

			console.log(filePath);
			fs.stat(filePath, (err, stats) => {
				assert.isNull(err);
				cb();
			});
		});

	});

});
