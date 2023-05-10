import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Box, colors, useTheme } from '@material-ui/core';
import { Pie } from 'react-chartjs-2';

import { DECIMAIS, numberFormat } from '../../../utils/formats';
import CardGrafico from './CardGrafico';

const PieChart = ({
	promise,
	promiseParams,
	values,
	infoLabel,
	value = { prefix: '', suffix: '', format: DECIMAIS.VALOR },
	infoValue = { prefix: '', suffix: '', format: DECIMAIS.VALOR },
	...props
}) => {
	const theme = useTheme();
	const [valores, setValores] = useState({});
	const [loading, setLoading] = useState(true);
	const [lastPromiseParamsCheck, setLastPromiseParamsCheck] = useState();

	useEffect(() => {
		const promiseParamsCheck = JSON.stringify(promiseParams);
		if (promiseParamsCheck === lastPromiseParamsCheck) {
			return;
		}
		setLastPromiseParamsCheck(promiseParamsCheck);

		setLoading(true);
		promise(promiseParams)
			.then(({ labels = [], values = [], info_values = [] }) => {
				let valoresObj = {};
				for (const i in labels) {
					valoresObj[labels[i]] = {
						value: values[i],
						info: info_values[i],
					};
				}
				setValores(valoresObj);
			})
			.finally(() => setLoading(false));
	}, [promise, promiseParams, lastPromiseParamsCheck]);

	const data = {
		datasets: [
			{
				data: values.map(v => valores[v.label] ? valores[v.label].value : 0),
				backgroundColor: values.map(v => v.color),
				borderColor: values.map(v => v.borderColor || v.color),
				hoverBorderColor: colors.common.white
			}
		],
		labels: values.map(v => {
			const sum = Object.values(valores).map(v => v.value).reduce((state, value) => state + value, 0);
			const current = valores[v.label] ? valores[v.label].value : 0;
			const percent = (current * 100) / sum;
			return `${v.desc} (${numberFormat(percent, DECIMAIS.PERCENTUAL)}%)`;
		}),
	};

	const options = {
		cutoutPercentage: 0,
		layout: { padding: 0 },
		legend: { display: true },
		maintainAspectRatio: false,
		responsive: true,
		tooltips: {
			callbacks: {
				label: ({ index, datasetIndex }, { datasets, labels }) => {
					let label = `${labels[index]}: `;
					if (value.prefix) label += value.prefix;
					label += numberFormat(datasets[datasetIndex].data[index], value.format);
					if (value.suffix) label += value.suffix;

					if (infoLabel && valores[values[index].label]) {
						label += ` (${infoLabel}: `;
						if (infoValue.prefix) label += infoValue.prefix;
						label += numberFormat(valores[values[index].label].info, infoValue.format);
						if (infoValue.suffix) label += infoValue.suffix;
						label += ')';
					}
					return label;
				},
			},
			backgroundColor: theme.palette.background.default,
			bodyFontColor: theme.palette.text.secondary,
			borderColor: theme.palette.divider,
			enabled: true,
			footerFontColor: theme.palette.text.secondary,
			intersect: false,
			mode: 'index',
			titleFontColor: theme.palette.text.primary
		},
	};

	return (
		<CardGrafico {...props} loading={loading}>
			<Box height={250} position="relative">
				<Pie
					data={data}
					options={options}
				/>
			</Box>
		</CardGrafico>
	);
}

PieChart.propTypes = {
	promise: PropTypes.func.isRequired,
}

export default PieChart;