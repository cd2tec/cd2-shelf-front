import React, { useState, useEffect } from 'react';
import {InputAdornment, makeStyles} from '@material-ui/core';

import { NumberField } from '../../../components/material';

const useStyles = makeStyles({
	input: {
		'& .MuiInputBase-input': {
			width: '40px'
		}
	}
})

const CustomTextField = ({
	disabled,
	value,
	onChange,
	errorText,
	onClick,
	InputProps = {},
	onInternalValueChange = () => { },
	...props
}) => {
	const classes = useStyles()
	const [internalValue, setInternalValue] = useState(value);
	useEffect(() => {
		setInternalValue(value);
	}, [value]);

	const handleChange = v => {
		if (v === '') v = null;
		if (v === value) return;
		onChange(v);
	}

	return (
		<NumberField
			className={classes.input}
			disabled={disabled}
			errorText={errorText}
			variant="standard"
			margin="none"
			value={internalValue}
			onChange={v => {
				setInternalValue(v);
				onInternalValueChange(v);
			}}
			onClick={onClick}
			onKeyPress={ev => {
				const keyCode = ev.which || ev.keyCode;
				if (keyCode === 13) handleChange(internalValue);
			}}
			onBlur={() => handleChange(internalValue)}
			InputProps={{
				...InputProps,
				startAdornment: <InputAdornment position="start">R$</InputAdornment>
			}}
			{...props} />
	);
}

export default CustomTextField;