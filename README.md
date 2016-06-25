
# Repack middleware
Simplify installatin of webpack-middleware with hot module replacement in an express-like application,
if using React, it will also add a res.renderReact(component, vars) to generate react html on the server
that can be used to iplement isomorphic react.

## Installation & usage

Frist, install the npm module
```
npm install --save-dev repack-middleware
```

Also (if using react, probably with babel compiler, install the dependencies)
```
npm install babel-core babel-loader babel-preset-es2015 babel-preset-react react react-dom
```

### Configuration files

Next, create your **webpack.config.js**
Example:

./webpack.config.js
```
module.exports = {
    entry: "./components/main.jsx",
    output: {
            //path: "./public/build",
            filename: "app.bundle.js",
            publicPath: "/build/"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel'
            }

        ]
    }
}

```  
The ```resolve``` is to allow us to load jsx without specifying the extension


Next, create a **.babelrc**
```
 { "presets": [ "es2015", "react" ] }
```




Now add the middleware into your server.
```
var repackMiddleware = require('repack-middleware');


app.use(repackMiddleware({
	configFile: __dirname + "/webpack.config.js",
    componentsPath: __dirname + "/components"
});

```

With the configuration above, the middlware will serve the bundled resource in the route **/build/app.bundle.js**  
Add it to your html:  

```
<script type="text/javascript" src="/build/app.bundle.js"></script>
```

### Usage

Example route:

```
res.renderReact('MainComponent', {myObjects: data}, function(err, html) {
    res.locals.reactHtml = html;
    res.render('index', {title: "Hello world"} );
});
```

Example component:


**MainComponent.jsx**  
This is the view that is being called form the route

```
import React from 'react';

export default class MainComponent extends React.Component {
	render() {
		var myObjects = this.props.myObjects || [];
		var myStyle = {
			border: "solid 1px #00F"
		};

		return (
			<div style={myStyle}>
				<h1>This is react</h1>
				{myObjects.map( (obj, idx) => {
					return <li key={idx}>[ {obj.count} ] {obj.name}</li>
				})}
			</div>
		);
	}
}
```


**main.jsx**  
This is the entrypoint in the webpack config
```
import MainComponent from './MainComponent.jsx'
import { render } from 'react-dom'

var doRender = function() {
	render(
		<MainComponent/>,
		document.getElementById("main")
	)
}
doRender();

if ( module.hot ) {
	module.hot.accept(function() {
		doRender();
	});
} 
```



With an index view (example provided in jade)
```
extends layout

block content
    h1= title
    div!= reactHtml
```

Note the ```!=``` used to inject the variable in unescaped way.


### Hot module replacement

Your code is responsible for handling the events.  
The module will have **module.hot** as an object, ready to accept notifications when it was modified.  
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

See a complete example here: [https://github.com/creyes52/repack-middleware-example]



## Documentation

### Config

Configuration options are passed to the middleware when it is created.

```repackMiddleware ( options )```

 * **options.configFile** - The path to your webpack.config.js
 * **options.productionMode** - Do not load the webpack and hmr middleware, any bundles should have been previously bundled
 * **options.componentsPath** - Specifies the folder

### renderReact

```res.renderReact ( componentRelativePath, propsObject, callback )```  

Callback signature  

``` callback ( err, html ) ```

This method is injected by the middleware in the res object to generate React html,  
from there the html value, which is the rendered react html can be injected into   
the view (unescaped, that depends on the view engine):

