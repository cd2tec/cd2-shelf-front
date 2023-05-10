import React from 'react';
import { FormControlLabel, Checkbox as CheckboxStd } from '@material-ui/core';

function Checkbox({
	color = 'primary',
	label,
	value,
	onChange = () => { },
}) {
	const checked = value === true;
	return (
		<FormControlLabel
			control={
				<CheckboxStd
					color={color}
					checked={checked}
					onChange={() => onChange(!checked)} />
			}
			label={label} />
	);
}

export default Checkbox;