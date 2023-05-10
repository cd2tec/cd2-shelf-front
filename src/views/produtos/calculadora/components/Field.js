import React from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
	field: {
		textAlign: 'right',
		fontSize: '1.4rem',
		fontWeight: 600,
		color: 'rgba(0,0,0,0.5)',
		border: 0,
		backgroundColor: 'transparent',
		width: '100%',
		'&:focus': {
			outline: 'none',
		}
	}
}));


const Field = ({ value, onChange, inputRef, isPrice, ...props }) => {
	const classes = useStyles();
	if (isPrice) {	
		props.thousandSeparator = "."
	}
  props.decimalScale = 3
	return (
		<div>
			<NumberFormat
				{...props}
				onValueChange={(values) => {
					onChange(values.floatValue || 0);
				}}
				className={classes.field}
				decimalSeparator=","
				fixedDecimalScale
				value={value}
				getInputRef={inputRef}

			/>
		</div>
	);
}

Field.propTypes = {
	onChange: PropTypes.func.isRequired,
};

export default Field;
