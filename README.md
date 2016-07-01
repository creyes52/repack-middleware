
# Repack middleware
Simply way to use React on your apps, with ES6 syntax, and JSX syntax, and hot module replacement. 


## Installation & usage

Frist, install the npm module
```
npm install repack-middleware
```

### Configuration files

Create a webpack config file
```
module.exports = {
    entry: "./components/main.jsx",
    output: {
        filename: "app.bundle.js",
        publicPath: "/build/"
    }
}
```


Add the middleware to your app.

```
var repackMiddleware = require('repack-middleware');

// ... include the middleware before other routes

app.use(repackMiddleware({
	configFile    : __dirname + "/webpack.config.js",
    componentsPath: __dirname + "/components"
}));
```


Include the bundled script in your html.
The middleware will generate the bundle in memory and serve it on the publicPath specified in the webpack.config.js 
```
<script type="text/javascript" src="/build/app.bundle.js"></script>
```

### Usage


Create the entry file:

**./components/main.jsx**
```
import MainComponent from './MainComponent.jsx'
import React from 'react';
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

And a single component

**./components/MainComponent.jsx**  
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

Generate the entry point as an empty div from your route  
This is so later, when doing server side rendering, the generated html will be here instead of an empty div.

```
/* GET home page. */
router.get('/', function(req, res, next) {
    var myProps = {
        data: [1,2,3]
    };
    
    res.renderReact('MainComponent', myProps, function(err, html) {
        res.locals.reactHtml = html;
        res.render('index', {title: "Hello world"} );
    });
});
```

And in the view (jade)
```
    != reactHtml
```

Note the ```!=``` used to inject the variable in unescaped way.

Testing

* Start your server
* Go and modify something in either .jsx file  
   Your browser should have received the modifications without reloading



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

