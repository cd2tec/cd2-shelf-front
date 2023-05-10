import React from 'react';

import TextField from './TextField';

function SelectField(props) {
	return <TextField select {...props} />;
}

export default SelectField;