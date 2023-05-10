import React, { useState, useEffect } from 'react';
import { InputAdornment, IconButton, Tooltip, makeStyles } from '@material-ui/core';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

import { NumberField } from '../../../../components/material';

const useStyles = makeStyles(
	{
		oferta: {
			'& .MuiInputBase-input': {
				color: 'red',
			},
		}
	},
);

const CustomTextField = ({
	disabled,
	value,
	onChange,
	errorText,
	showOfertaIcon = false,
	isOferta,
	handleProdutoOferta,
}) => {
	const classes = useStyles();
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
			disabled={disabled}
			errorText={errorText}
			variant="standard"
			margin="none"
			className={isOferta && classes.oferta}
			value={internalValue}
			onChange={v => setInternalValue(v)}
			onKeyPress={ev => {
				const keyCode = ev.which || ev.keyCode;
				if (keyCode === 13) handleChange(internalValue);
			}}
			onBlur={() => handleChange(internalValue)}
			InputProps={{
				startAdornment: <InputAdornment position="start">R$</InputAdornment>,
				endAdornment: showOfertaIcon ? (
					<InputAdornment position="end">
						<IconButton onClick={handleProdutoOferta} style={{ padding: 8, marginRight: 4 }}>
							<Tooltip title="Oferta" position="to" placement="top" >
								<LocalOfferIcon color={isOferta ? `secondary` : undefined} />
							</Tooltip>
						</IconButton>
					</InputAdornment>
				) : null,
			}} />
	);
}

export default CustomTextField;