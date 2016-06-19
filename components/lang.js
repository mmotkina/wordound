import React from 'react';

const Lang = React.createClass({
    render() {
        return (
            <span className='lang' onClick={this.props.onClick}>{this.props.text}</span>
        );
    }
});

export default Lang;
