import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
	KeyboardDatePicker,
	DatePicker as StdDatePicker,
} from '@material-ui/pickers';

import { FormHelperText, FormControl, withWidth } from '@material-ui/core';
import CalendarIcon from '@material-ui/icons/Event';

const DatePicker = (props) => {
	const {
		name, label, onChange, fullWidth, required, views,
		minDate, minDateMessage, maxDate, maxDateMessage,
		errorText, helpText, width, disabled, clearable,
		keyboard, autoOk, shouldDisableDate, onMonthChange,
		onYearChange, renderDay, disablePast, disableFuture,
		format,
	} = props;

	const [value, setValue] = useState(props.value ? moment(props.value, 'YYYY-MM-DD') : null);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		setValue(props.value ? moment(props.value, 'YYYY-MM-DD') : null);
	}, [props.value]);

	const enableKeyboard = keyboard === true || keyboard === false ? keyboard : width !== 'xs';
	const Component = enableKeyboard ? KeyboardDatePicker : StdDatePicker;

	let customProps = {};
	if (enableKeyboard) {
		customProps.keyboardIcon = <CalendarIcon />;
	}

	const handleChange = (callback, name) => value => {
		setValue(value);
		setHasError(false);

		if (!value || value.isValid()) {
			const v = value ? value.format('YYYY-MM-DD') : null;
			callback(v, { field: name, value: v });
		}
	}

	return (
		<FormControl fullWidth={fullWidth} error={!!errorText || hasError} margin="normal">
			<Component {...customProps}
				views={views}
				name={name || ''}
				inputVariant="outlined"
				label={label}
				required={required}
				disabled={disabled}
				clearable={clearable}
				error={!!errorText}
				autoOk={autoOk === true || autoOk === false ? autoOk : width === 'xs'}
				value={value}
				onChange={handleChange(onChange, name)}
				onError={() => setHasError(true)}
				fullWidth={true}
				format={format}
				placeholder="01/01/2001"
				cancelLabel="Cancelar"
				clearLabel="Limpar"
				todayLabel="Hoje"
				invalidDateMessage="Data Inválida"
				minDate={minDate}
				maxDate={maxDate}
				minDateMessage={minDateMessage}
				maxDateMessage={maxDateMessage}
				disablePast={disablePast}
				disableFuture={disableFuture}
				shouldDisableDate={shouldDisableDate}
				onMonthChange={onMonthChange}
				onYearChange={onYearChange}
				renderDay={renderDay} />

			{(errorText || helpText) && (
				<FormHelperText>{errorText || helpText}</FormHelperText>
			)}
		</FormControl>
	);
};

DatePicker.propTypes = {
	width: PropTypes.string.isRequired,

	name: PropTypes.string,
	label: PropTypes.string.isRequired,

	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,

	disabled: PropTypes.bool,
	required: PropTypes.bool,
	fullWidth: PropTypes.bool,
	errorText: PropTypes.any,
	helpText: PropTypes.any,
	clearable: PropTypes.bool,
	format: PropTypes.string,

	maxDate: PropTypes.string,
	minDate: PropTypes.string,
	minDateMessage: PropTypes.string.isRequired,
	maxDateMessage: PropTypes.string.isRequired,
	autoOk: PropTypes.bool,
	keyboard: PropTypes.bool,
	shouldDisableDate: PropTypes.func,
	onMonthChange: PropTypes.func,
	onYearChange: PropTypes.func,
	renderDay: PropTypes.func,
	disablePast: PropTypes.bool,
	disableFuture: PropTypes.bool,
};

DatePicker.defaultProps = {
	fullWidth: true,
	disabled: false,
	autoOk: true,

	format: 'DD/MM/YYYY',
	minDate: '2000-01-01',
	maxDate: '2100-12-31',
	minDateMessage: 'A data não pode ser anterior a data mínima',
	maxDateMessage: 'A data não pode ser posterior a data máxima',
};

export default withWidth()(DatePicker);
