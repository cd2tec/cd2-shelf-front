import React from 'react';

import {
	Radio, RadioGroup as RadioGroupStd,
	FormControl, FormLabel, FormControlLabel, FormHelperText,
} from '@material-ui/core';

export function RadioGroupOption({ children, value, ...props }) {
	return (
		<FormControlLabel
			control={<Radio />}
			value={value}
			label={children}
			{...props} />
	);
}

export function RadioGroup({ label, value, onChange, helperText, errorText, ...props }) {
	return (
		<FormControl component="fieldset" error={!!errorText} style={{ marginTop: 8 }}>
			{label ? <FormLabel component="legend">{label}</FormLabel> : null}

			<RadioGroupStd
				value={value || ''}
				onChange={(ev, value) => onChange(value, ev)}
				{...props} />

			{errorText || helperText
				? <FormHelperText>{errorText || helperText}</FormHelperText>
				: null}
		</FormControl>
	);
}