var assert  = require('chai').assert;
var helpers = require('../helpers.js');
var fs      = require('fs');
var path        = require('path');
var _       = require('lodash');
var reactHelper = require('../reactHelper')({
	componentsPath: __dirname + "/stubs",
	configFile: './test/stubs/webpack.config.js',
	isProd: false
});


describe('module', function() {

	describe('reactHelper.js', function() {

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

		it('should compile a component, given the default configuration', function(cb) {
		this.timeout(9000);
			reactHelper.createBundle(cb, false, true);
		});


	});

});
