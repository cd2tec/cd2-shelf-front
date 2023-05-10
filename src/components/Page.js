import React, { forwardRef } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { UN } from '../assets/logos';

const Page = forwardRef(({
	children,
	title = '',
	showWatermark = false,
	...rest
}, ref) => {
	return (
		<div
			ref={ref}
			{...rest}
		>
			<Helmet>
				<title>{title} - Unexx Shelf</title>
			</Helmet>
			{children}

			{showWatermark ? (
				<UN width="80px" style={{
					width: 100,
					margin: 8,
					position: 'fixed',
					right: 0,
					bottom: 0,
				}} />
			) : null}
		</div>
	);
});

Page.propTypes = {
	children: PropTypes.node.isRequired,
	title: PropTypes.string
};

export default Page;
