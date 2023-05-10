import React from 'react';
import { TextField as TextFieldStd } from '@material-ui/core';

function TextField({
	value,
	onChange = () => { },
	variant = 'outlined',
	margin = 'normal',
	errorText,
	helperText,
	fullWidth = true,
	...props
}) {
	return (
		<TextFieldStd
			{...props}
			fullWidth={fullWidth}
			variant={variant}
			margin={margin}
			value={value || ''}
			error={!!errorText}
			helperText={errorText || helperText}
			onChange={ev => onChange(ev.target.value, ev)} />
	);
}

export default TextField;