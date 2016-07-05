var React          = require('react');
var ReactDOMServer = require('react-dom/server');
var path           = require('path');
var webpack        = require('webpack');
var temp           = require('temp');
var _              = require('lodash');

temp.track();

var Reconfigure          = require('./reconfigure.js');
var components = {};
var usingBabelRegister = false;

module.exports = function(options) {
    var isProd         = options.isProd;
    var componentsPath = options.componentsPath;
	var targetId       = options.elementId || "main";

    if ( !usingBabelRegister && options.serverRender ) {
        usingBabelRegister = true;
        require('babel-register')({
            presets: ['babel-preset-react', 'babel-preset-es2015'].map(require.resolve)
        });
    }

    var wrapHtml = function(html, vars, componentName) {
        var INIT = {
            initialProps: vars,
            rootComponent: componentName
        };
        return `<div id='${targetId}'>${html}</div>`
             + `<script type='text/javascript'>var INIT = ${JSON.stringify(INIT)}</script>`;
    }

	var createBundle = function(cb) {
		var reconf = new Reconfigure(options);
		var config = reconf.addDefaultConfiguration( reconf.webpackConfig );
		config = reconf.addReact( config );

		var compiler = webpack(config);

		compiler.run(function(err, stats) {
			if ( err ) 
				console.error("Fatal error:", err );

			var jsonStats = stats.toJson();
			if ( jsonStats.errors.length > 0) {
				console.error("Errors found:" );
				jsonStats.errors.forEach( val => {
					console.log( "#### => ", val );
				});
			}
			if ( jsonStats.warnings.length > 0) {
				console.error("Warnings found:", jsonStats.warnings);
			}

			console.log("success");
			cb();
		});
	}


    var renderFn = function(componentName, vars, req, cb) {
        var component = components[componentName];

        //
        //  Load the component, a component Type
        //
        if ( options.serverRender && component == undefined ) {
            var compPath  = path.join(componentsPath, `${componentName}.jsx`);
            if ( !isProd ) {
                // invalidate cache
                delete require.cache[require.resolve(compPath)];
            }
            var compObj   = require( compPath );
            compObj       = compObj.default || compObj;

            //console.log(`loading component ${compPath} === ${compObj}`);
            if ( typeof compObj == 'function') {
                // we are dealing with a component directly
                component = React.createFactory( compObj );
            }
            components[componentName] = component;
        }
        
        //console.log("component", component);
        if ( options.serverRender && typeof component == 'function') {
            
            var element   = component(vars);
            var reactHtml = ReactDOMServer.renderToString( element );
            var html      = wrapHtml(reactHtml, vars, componentName);
            cb ( null, html );
        
        } else {
            cb( null, wrapHtml("", vars, componentName));
        }

    }

    var renderMiddleware = function renderMiddleware(req, res, next) {
        res.renderReact = function(component, vars, cb) {
            try {
                renderFn( component, vars, req, cb);
                //res.locals.reactHtml = html;
                //return html;
            } catch(err) {
                if ( res.serverError ) { // sails
                    res.serverError(err);
                } else { // vainilla express
                    res.status(500).send(err.message);
                }
            }
        }
        next();
    }


    return {
        renderMiddleware: renderMiddleware,
        renderFn: renderFn,
		createBundle: createBundle
    };
};

