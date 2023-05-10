import React from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import TextField from './TextField';

function NumberFormatCustom(props) {
	const { inputRef, onChange, decimals, ...other } = props;

	return (
		<NumberFormat
			{...other}
			getInputRef={inputRef}
			onValueChange={(values) => {
				onChange({
					target: {
						value: values.floatValue || 0,
					},
				});
			}}
			thousandSeparator="."
			decimalSeparator=","
			decimalScale={decimals}
			fixedDecimalScale
		/>
	);
}

NumberFormatCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

function NumberField({ value, onChange, InputProps = {}, inputProps = {}, decimals = 2, ...props }) {
	return (
		<TextField
			{...props}
			value={value || 0}
			onChange={v => onChange(v)}
			inputProps={{ ...inputProps, decimals }}
			InputProps={{
				...InputProps,
				inputComponent: NumberFormatCustom,
			}} />
	);
}

export default NumberField;