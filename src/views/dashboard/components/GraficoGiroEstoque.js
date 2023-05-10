import React, { useEffect, useState } from 'react';

import { Box, useTheme, colors } from '@material-ui/core';
import { Bar } from 'react-chartjs-2';
import CardGrafico from './CardGrafico';
import { AnalyticsAPI, defaultProcessCatch } from '../../../services/api';

const GraficoGiroEstoque = ({ periodo }) => {
	const theme = useTheme();
	const [values, setValues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastPeriodoCheck, setLastPeriodoCheck] = useState();

	useEffect(() => {
		const periodoCheck = JSON.stringify(periodo);
		if (periodoCheck === lastPeriodoCheck) {
			return;
		}
		setLastPeriodoCheck(periodoCheck);

		setLoading(true);
		AnalyticsAPI.giroEstoque(periodo)
			.finally(() => setLoading(false))
			.then(rs => {
				const { fields = [], values = [] } = rs.data || {};
				const data = values.map(v => {
					let data = {};
					for (let index in fields) {
						data[fields[index]] = v.values[index];
					}
					return data;
				});
				setValues(data);
			})
			.catch(defaultProcessCatch());
	}, [periodo, lastPeriodoCheck]);


	const data = {
		datasets: [
			{
				barThickness: 12,
				barPercentage: 0.5,
				maxBarThickness: 10,
				categoryPercentage: 0.5,
				backgroundColor: colors.indigo[500],
				data: values.map(v => Number(v.quantidade)),
			},
		],
		labels: values.map(v => `${v.dias} Dias`)
	};

	const options = {
		animation: false,
		cornerRadius: 10,
		layout: { padding: 0 },
		legend: { display: false },
		maintainAspectRatio: false,
		responsive: true,

		scales: {
			xAxes: [
				{
					ticks: {
						fontColor: theme.palette.text.secondary
					},
					gridLines: {
						display: false,
						drawBorder: false
					}
				}
			],
			yAxes: [
				{
					ticks: {
						fontColor: theme.palette.text.secondary,
						beginAtZero: true,
						min: 0
					},
					gridLines: {
						borderDash: [2],
						borderDashOffset: [2],
						color: theme.palette.divider,
						drawBorder: false,
						zeroLineBorderDash: [2],
						zeroLineBorderDashOffset: [2],
						zeroLineColor: theme.palette.divider
					}
				}
			]
		},
		tooltips: {
			backgroundColor: theme.palette.background.default,
			bodyFontColor: theme.palette.text.secondary,
			borderColor: theme.palette.divider,
			borderWidth: 1,
			enabled: true,
			footerFontColor: theme.palette.text.secondary,
			intersect: false,
			mode: 'index',
			titleFontColor: theme.palette.text.primary
		}
	};

	return (
		<CardGrafico
			loading={loading}
			title="Giro de Estoque"
			helpText="Posição de estoque dos produtos, de acordo com o giro médio das vendas (em dias)">
			<Box height={250} position="relative">
				<Bar data={data} options={options} />
			</Box>
		</CardGrafico>
	)
}

export default GraficoGiroEstoque;