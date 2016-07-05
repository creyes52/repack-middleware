
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

Create the main component:

**./components/MainComponent.jsx**  
This is the view that is being called form the route

```
import React from 'react';

export default class MainComponent extends React.Component {
    render() {
        var myObjects = this.props.myObjects || [];
        var myStyle = {
            border: "solid 1px #0F0"
        };

        return (
            <div style={myStyle}>
                <h1>This could be React</h1>
                {myObjects.map( (obj, idx) => {
                    return <li key={idx}> {obj.size} {obj.name}</li>
                })}
            </div>
        );
    }
}
```


Now, in your route, call res.renderReact() to generate the insert html where the the react component
should be inserted.

```
/* GET home page. */
router.get('/', function(req, res, next) {
	var myProps = {
        myObjects: [
        	{name: "User 1", size: 11},
        	{name: "User 2", size: 20},
        	{name: "User 3", size: 30}
        ]
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

options

|  option        | default    |            Description             |
|------------    |------------|------------------------------------|
| configFile     |required    | The path to your webpack.config.js |
| componentsPath |required    | The root folder of your components |
| productionMode | process.env.NODE_ENV == 'production'       | when true disables webpack middleware and hot module replacement, your app must serve a pregenerated bundle |
| serverRender   | false      | enables server side rendering, currently relies on babel-require which is not suitable for production usage |
| elementId      | "main"     | The id of the div that will be created containing server side rendered html if enabled or empty (the node on which the React root component will be mounted) |
| generateEntry  | true       | generate a .startup.jsx that can initialize any component directly in the componentsPath folder |


### renderReact

```res.renderReact ( componentName, propsObject, callback )```

the **propsObject** should specify the initial props, these will be inserted in a &lt;script&gt; tag  
to initialize the **componentName** with these props.

Callback signature  

``` callback ( err, html ) ```

This method is injected by the middleware in the res object to generate React html,  
from there the html value, which is the rendered react html can be injected into   
the view (unescaped, that depends on the view engine):

