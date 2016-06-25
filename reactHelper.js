var React          = require('react');
var ReactDOMServer = require('react-dom/server');
var helpers        = require('./helpers.js');
var path           = require('path');
require('babel-register');

var components = {};

module.exports = function(options) {
    var isProd         = options.isProd;
    var componentsPath = options.componentsPath;

    var wrapHtml = function(html, vars) {
        return `<div id='main'>${html}</div>`
                + `<script type='text/javascript'>var INIT = ${JSON.stringify(vars)}</script>`;
    }

    var renderFn = function(componentName, vars, req, cb) {
        var component = components[componentName];

        //
        //  Load the component, either a component Type or a router plain config
        //
        if ( component == undefined ) {
            var compPath  = path.join(componentsPath, `${componentName}.jsx`);
            var compObj   = require( compPath ).default;

            //console.log(`loading component ${compPath} === ${compObj}`);
            if ( typeof compObj == 'function') {
                // we are dealing with a component directly
                component = React.createFactory( compObj );
            } else {
                component = compObj;
            }

            if ( isProd ) {
                components[componentName] = component; 
            }
        }
        
        //console.log("component", component);
        if ( typeof component == 'function') {
            
            var element   = component(vars);
            var reactHtml = ReactDOMServer.renderToString( element );
            var html      = wrapHtml(reactHtml, vars);
            cb ( null, html );

        } else {
            
            // match the routes to the url
            var location = req.url;
            match({ routes: component, location: location }, (err, redirect, props) => {
                // in here we can make some decisions all at once
                if (err) {
                    // there was an error somewhere during route matching
                    throw err;
                } else if (redirect) {
                    // we haven't talked about `onEnter` hooks on routes, but before a
                    // route is entered, it can redirect. Here we handle on the server.
                    res.redirect(redirect.pathname + redirect.search)
                } else if (props) {
                    // if we got props then we matched a route and can render
                    const appHtml = RouterContextFactory(props);

                    // dump the HTML into a template, lots of ways to do this, but none are
                    // really influenced by React Router
                    var reactHtml = ReactDOMServer.renderToString(appHtml);
                    var html      = wrapHtml( reactHtml, vars );
                    cb ( err, html );
                } else {
                    cb ( null, null ); // null for not found
                }
            });
        
        }// if typeof component == 'function'

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
        renderFn: renderFn
    };
};

