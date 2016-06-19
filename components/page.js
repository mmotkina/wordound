import React from 'react';
import Wordound from './wordound';

const Page = React.createClass({
	render() {
		return (
			<div className="page">
				<h1 className="logo">wordound</h1>
				<Wordound />
			</div>
		);
	}
});

export default Page;
