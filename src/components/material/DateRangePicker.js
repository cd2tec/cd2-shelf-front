import React, { useState, useContext, useEffect } from 'react'
import { colors } from '@material-ui/core'
import { DatePicker, MuiPickersContext } from '@material-ui/pickers'
import moment from 'moment'

export default function DateRangePicker({
	value,
	onChange,
	labelFunc,
	format,
	emptyLabel,
	autoOk,
	inputVariant = 'outlined',
	margin = 'normal',
	...props
}) {
	const [begin, setBegin] = useState(value[0] ? moment(value[0], 'YYYY-MM-DD') : null)
	const [end, setEnd] = useState(value[1] ? moment(value[1], 'YYYY-MM-DD') : null)
	const [hover, setHover] = useState(null)
	const utils = useContext(MuiPickersContext)

	useEffect(() => {
		setBegin(value[0] ? moment(value[0], 'YYYY-MM-DD') : null);
		setEnd(value[1] ? moment(value[1], 'YYYY-MM-DD') : null);
	}, [value]);

	const min = Math.min(begin, end || hover)
	const max = Math.max(begin, end || hover)
	const today = moment()

	function renderDay(day, selectedDate, dayInCurrentMonth, dayComponent) {
		const style = {
			margin: 0,
			width: '40px'
		}

		if (day >= min && day <= max) {
			style.backgroundColor = colors.lightBlue[600]
			style.color = 'white'
		} else if (utils.isSameDay(day, today)) {
			style.backgroundColor = 'white'
			style.color = colors.lightBlue[600]
		}

		if (utils.isSameDay(day, min)) {
			style.borderRadius = utils.isSameDay(day, max) ? '50%' : '50% 0 0 50%';
		} else if (utils.isSameDay(day, max)) {
			style.borderRadius = '0 50% 50% 0'
		} else if (utils.isAfterDay(day, min) && utils.isBeforeDay(day, max)) {
			style.borderRadius = '0'
		}

		return React.cloneElement(dayComponent, {
			onClick: e => {
				e.stopPropagation()
				if (!begin) setBegin(day)
				else if (!end) {
					setEnd(day)
					if (autoOk) {
						onChange([begin, end].sort(sortDates).map(d => d.format('YYYY-MM-DD')))
					}
				} else {
					setBegin(day)
					setEnd(null)
				}
			},
			onMouseEnter: e => setHover(day),
			style
		})
	}

	const formatDate = date => utils.format(date, format || utils.dateFormat)

	return (
		<DatePicker
			{...props}
			value={null}
			cancelLabel="Cancelar"
			okLabel="Escolher"
			inputVariant={inputVariant}
			margin={margin}
			renderDay={renderDay}
			onClose={() => {
				onChange([begin, end].sort(sortDates).map(d => d.format('YYYY-MM-DD')))
			}}
			onChange={() => { }}
			labelFunc={(date, invalid) =>
				labelFunc
					? labelFunc([begin, end].sort(sortDates), invalid)
					: begin && end
						? `${formatDate(begin)} - ${formatDate(end)}`
						: emptyLabel
			}
			fullWidth={true}
			InputLabelProps={{
				shrink: value && value.length === 2 && value[0] && value[1] ? true : false,
			}}
		/>
	)
}

const sortDates = (a, b) => {
	return a.isAfter(b, 'day') ? 1 : a.isSame(b, 'day') ? 0 : -1;
};
