import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, useTheme, colors } from '@material-ui/core';
import CardGrafico from './CardGrafico';

const data = {
	datasets: [
		{
			barThickness: 12,
			barPercentage: 0.5,
			maxBarThickness: 10,
			categoryPercentage: 0.5,
			backgroundColor: colors.indigo[500],
			borderColor: colors.indigo[500],
			data: [18, 5, 19, 10, 5, 19, 20, 40, 10, 20, 30],
			label: 'Ano Atual',
			fill: false,
			borderJoinStyle: 'miter',
		},
		{
			barThickness: 12,
			barPercentage: 0.5,
			maxBarThickness: 10,
			categoryPercentage: 0.5,
			backgroundColor: colors.lightGreen[200],
			borderColor: colors.lightGreen[200],
			data: [11, 20, 12, 29, 30, 29, 13, 32, 10, 15, 20],
			label: 'Ano Passado',
			fill: false,
			borderJoinStyle: 'miter',
		}
	],
	labels: ['1 de Agosto', '2 de Agosto', '3 de Agosto', '4 de Agosto', '5 de Agosto', '6 de Agosto', '7 de Agosto', '8 de Agosto', '9 de Agosto']
};

const GraficoCompetividade = () => {
	const theme = useTheme();
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
		<CardGrafico title="Competitividade" helpText="Escala de competitividade baseada no resumo das pesquisas de preços realizadas no período">
			<Box height={250} position="relative">
				<Line data={data} options={options} />
			</Box>
		</CardGrafico>
	);
}

export default GraficoCompetividade;