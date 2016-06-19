import React from 'react';

const Input = React.createClass({
    _onChange(evt) {
        this.props.onChange && this.props.onChange(evt);
    },

    _onKeyPress(evt) {
        this.props.onKeyPress && this.props.onKeyPress(evt);
    },

    render() {
        return (
            <input 
                className='input'
                type='text'
                value={this.props.value}
                onChange={this._onChange}
                onKeyPress={this._onKeyPress}
                placeholder={this.props.placeholder} />
        );
    }
});

export default Input;
