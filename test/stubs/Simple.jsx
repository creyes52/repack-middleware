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

export default Simple;