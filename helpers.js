var fs = require('fs');
var path = require('path');

var helpers = {

	bases: [ "" , "/node_modules", "/../"],

	findModule: function(name) {
		var i     = 0;
		var bases = helpers.bases.map( val => __dirname + val );
		
		while ( i < bases.length ) {
			try {
				var folders = fs.readdirSync(bases[i]);
				if ( folders.indexOf(name) != -1 ) {
					return path.join(bases[i], name);
				}
			} catch(err) {
				//console.error(err);
			}
			i++;
		}
	} 
};

module.exports = helpers;
