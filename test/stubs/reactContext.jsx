import React from 'react';
import { Link } from 'react-router';

class Simple extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="col-md-5">Elemento uno</div>
                <div className="col-md-7">elemento dos</div>
            </div>
        );
    }
};

class Layout extends React.Component{
	constructor() {
		super();
	}
	render() {
		return (
			<div>
				<h1>Sails react isomorphic site</h1>
				<ul role="nav" className="nav">
					<li><Link to='/about'>About</Link></li>
					<li><Link to='/about2'>About2</Link></li>
				</ul>
				<div className="container">
					{this.props.children}
				</div>
			</div>
		);
	}
}

var routes = {
	path: "/",
	component: Layout,
	childRoutes: [
		{
			path: "/about",
			component: Simple
		},
		{
			path: "/about2",
			component: Simple
		}
	]
};

export default routes;