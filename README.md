
# Repack middleware
Simplify installatin of webpack-middleware with hot module replacement in an express-like application,
if using React, it will also add a res.renderReact(component, vars) to generate react html on the server
that can be used to iplement isomorphic react.

## Installation & usage

Frist, install the npm module
```
npm install --save-dev repack-middleware
```

Next, create your webpack config
Example:

./webpack.config.js
```
module.exports = {
        entry: "./components/main.js",
        output: {
                //path: "./public/build",
                filename: "app.bundle.js",
                publicPath: "/build/"
        }
}

```

Now add the middleware into your server.
```
var repackMiddleware = require('repack-middleware');


app.use(repackMiddleware({
	configFile: __dirname + "/webpack.config.js"
});

```

With the configuration above, the middlware will serve the bundled resource in the route **/build/app.bundle.js**  
Add it to your html:  

```
<script type="text/javascript" src="/build/app.bundle.js"></script>
```

Now, the module will have **module.hot** as an object.
Example of how to make the module aware of changes.
```
var render = function() {
    document.getElementById("main").innerHTML = "Hola mundo " + Date.now();
}
render();

if ( module.hot ) { 
    module.hot.accept(function() {
        render();
    }); 
}
```


## Documentation

### Config
Configuration options are passed to the middleware when it is created.

 * **configFile** - The path to your webpack.config.js
 * **productionMode** - Do not load the webpack and hmr middleware, any bundles should have been previously bundled


