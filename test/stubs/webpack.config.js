module.exports = {
	entry: "./test/stubs/Simple.jsx",
	output: {
		path: "./test/test-build/",
		filename: "app.bundle.js",
		publicPath: "/build/"
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['es2015', 'react']
				}
			}
		]
	}
}
