import React from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, FormHelperText } from '@material-ui/core';

function CheckboxGroup({ disabled, label, required, options, value = [], onChange = () => { }, errorText }) {
	const toggleValue = optionValue => {
		if (value.indexOf(optionValue) > -1) {
			onChange(value.filter(v => v !== optionValue));
		} else {
			onChange([...value, optionValue]);
		}
	}

	return (
		<FormControl disabled={disabled} required={required} error={!!errorText} component="fieldset">
			<FormLabel component="legend">{label}</FormLabel>
			<FormGroup>
				{options.map((o, index) => {
					const checked = value.indexOf(o.value) > -1;
					return (
						<FormControlLabel
							key={index}
							control={
								<Checkbox
									checked={checked}
									onChange={() => toggleValue(o.value)} />
							}
							label={o.label} />
					);
				})}
			</FormGroup>
			{errorText ? <FormHelperText>{errorText}</FormHelperText> : null}
		</FormControl>
	);
}

export default CheckboxGroup;