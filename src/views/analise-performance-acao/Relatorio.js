import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import {
	Container, Card, CardContent,
	CardHeader, Grid, CardActions,
	Divider, Button, TableContainer,
	Paper, TableHead,
	Table, TableRow, TableCell, makeStyles,
	colors, TableBody, useTheme, IconButton,
	Dialog, DialogTitle, DialogActions, DialogContent, TableFooter,
} from '@material-ui/core';

import {
	OpenInNew,
} from '@material-ui/icons';

import Page from '../../components/Page';
import { DateRangePicker, TableSort, TableSortColumn } from '../../components/material';

import SearchAcaoField from './SearchAcaoField';
import { AcaoVendaAPI, GerarGraficoAnalisePerformanceRequestTipo, defaultProcessCatch } from '../../services/api';
import { numberFormat, DECIMAIS } from '../../utils/formats/number';
import { showLoading } from '../../utils/loading';

const useStyles = makeStyles(() => ({
	tableResponsive: {
		overflowX: 'auto',
		'& table> thead> tr> th': {
			textTransform: 'uppercase',
		},
		'& table> thead> tr> th, &> table> thead> tr> td': {
			paddingRight: 0,
		}
	},

	columnSpanRef: {
		backgroundColor: colors.yellow[200],
		paddingRight: 16,
		borderBottom: 'none',
	},
	columnSpanAcao: {
		backgroundColor: colors.blue[200],
		paddingRight: 16,
		borderBottom: 'none',
	},
	columnSpanPef: {
		backgroundColor: colors.green[200],
		paddingRight: 16,
		borderBottom: 'none',
	},
}));

const CellsPeriodo = ({ periodo, ...props }) => {
	if (!periodo) return null;
	return (
		<React.Fragment>
			<TableCell {...props}>
				{numberFormat(periodo.quantidade, DECIMAIS.QUANTIDADES)}
			</TableCell>
			<TableCell {...props}>
				{numberFormat(periodo.valor, DECIMAIS.VALOR)}
			</TableCell>
			<TableCell {...props}>
				{numberFormat(periodo.lucro, DECIMAIS.VALOR)}
			</TableCell>
			<TableCell {...props}>
				{numberFormat(periodo.lucro_percentual, DECIMAIS.PERCENTUAL)}%
			</TableCell>

		</React.Fragment>
	);
}

const Grafico = ({ title, data }) => {
	const [open, setOpen] = useState(false);
	const theme = useTheme();

	const {
		labels = [],
		values = [],
	} = data || {};

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
						display: true,
						drawBorder: false
					}
				}
			],
			yAxes: [
				{
					ticks: {
						fontColor: theme.palette.text.secondary,
						// callback: value => {
						// 	if (value !== 0) return value + '%';
						// }
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
		<React.Fragment>
			<Card>
				<CardHeader
					title={title}
					action={data && data.table ? (
						<IconButton onClick={() => setOpen(true)}>
							<OpenInNew />
						</IconButton>
					) : undefined} />
				<div style={{ height: 250 }}>
					<Bar
						options={options}
						data={{
							datasets: [
								{
									backgroundColor: colors.indigo[500],
									data: values,
								},
							],
							labels: labels,
						}} />
				</div>
			</Card>

			{open ? (
				<Dialog open={true} maxWidth="md" fullWidth onClose={() => setOpen(false)}>
					<DialogTitle>{title}</DialogTitle>

					<DialogContent style={{ padding: 0 }}>
						<Table size="small">
							<TableHead>
								<TableRow>
									{data.table.columns.map((c, index) => (
										<TableCell key={index}>{c.name}</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{data.table.rows.map((r, index) => (
									<TableRow key={index}>
										{r.values.map((v, index) => (
											<TableCell key={index}>{v}</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</DialogContent>

					<DialogActions>
						<Button onClick={() => setOpen(false)}>Fechar</Button>
					</DialogActions>
				</Dialog>
			) : null}
		</React.Fragment>
	)
}

const Graficos = ({ analise }) => {
	const [produto, setProduto] = useState({});
	const [categoria, setCategoria] = useState({});
	const [departamento, setDepartamento] = useState({});

	useEffect(() => {
		AcaoVendaAPI.gerarGraficoAnalisePerformance({ analise, tipo: GerarGraficoAnalisePerformanceRequestTipo.PRODUTO })
			.then(rs => setProduto(rs))
			.catch(defaultProcessCatch());

		AcaoVendaAPI.gerarGraficoAnalisePerformance({ analise, tipo: GerarGraficoAnalisePerformanceRequestTipo.CATEGORIA })
			.then(rs => setCategoria(rs))
			.catch(defaultProcessCatch());

		AcaoVendaAPI.gerarGraficoAnalisePerformance({ analise, tipo: GerarGraficoAnalisePerformanceRequestTipo.DEPARTAMENTO })
			.then(rs => setDepartamento(rs))
			.catch(defaultProcessCatch());
	}, [analise]);

	return (
		<React.Fragment>
			<Grid item xs={4}>
				<Grafico
					title="Produto > Quantidade"
					data={produto.quantidade} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Produto > Valor"
					data={produto.valor} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Produto > Margem"
					data={produto.margem} />
			</Grid>

			<Grid item xs={4}>
				<Grafico
					title="Categoria > Quantidade"
					data={categoria.quantidade} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Categoria > Valor"
					data={categoria.valor} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Categoria > Margem"
					data={categoria.margem} />
			</Grid>

			<Grid item xs={4}>
				<Grafico
					title="Departamento > Quantidade"
					data={departamento.quantidade} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Departamento > Valor"
					data={departamento.valor} />
			</Grid>
			<Grid item xs={4}>
				<Grafico
					title="Departamento > Margem"
					data={departamento.margem} />
			</Grid>
		</React.Fragment>
	);
}

const FooterTable = ({ relatorio }) => {
	return (
		<TableFooter>
			<TableRow>
				<TableCell colSpan={6}></TableCell>

				<CellsPeriodo periodo={relatorio.referencia} style={{ backgroundColor: colors.yellow[200] }} />
				<CellsPeriodo periodo={relatorio.periodo_acao} style={{ backgroundColor: colors.blue[200] }} />
				<CellsPeriodo periodo={relatorio.comparativo} style={{ backgroundColor: colors.green[200] }} />
			</TableRow>
		</TableFooter>

	);
}

const Relatorio = () => {
	const classes = useStyles();
	const [loading, setLoading] = useState(false);
	const [acoes, setAcoes] = useState([]);
	const [relatorio, setRelatorio] = useState({});
	// const [analise, setAnalise] = useState([moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
	// const [referencia, setReferencia] = useState([moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]);
	const [analise, setAnalise] = useState(['2020-03-09', '2020-03-13']);
	const [referencia, setReferencia] = useState(['2020-03-02', '2020-03-06']);

	const analisePerformanceParams = {
		acoes: acoes.map(a => ({ uuid: a.uuid })),
		analise: { inicio: analise[0], fim: analise[1] },
		referencia: { inicio: referencia[0], fim: referencia[1] },
	};

	const submit = () => {
		setLoading(true);

		showLoading(
			'Gerando análise de performance...',
			AcaoVendaAPI.gerarAnalisePerformance(
				analisePerformanceParams)
				.then(rs => setRelatorio(rs || {}))
				.catch(defaultProcessCatch())
		);
	}

	const customColumns = (periodo) => {
		return [
			{
				cor: colors.yellow[200],
				periodo: periodo.referencia,
				field: 'referencia',
			},
			{
				cor: colors.blue[200],
				periodo: periodo.periodo_acao,
				field: 'periodo_acao',
			},
			{
				cor: colors.green[200],
				periodo: periodo.comparativo,
				field: 'comparativo',
			},
		];
	}

	return (
		<Page title="Análise de performace de ação">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={12}>
						<Card>
							<CardHeader title="Análise de performance de ação" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<SearchAcaoField
											value={acoes}
											onChange={setAcoes} />
									</Grid>
									<Grid item xs={6}>
										<DateRangePicker
											format="DD/MM/YYYY"
											label="Período de Análise"
											value={analise}
											onChange={analise => setAnalise(analise)} />
									</Grid>
									<Grid item xs={6}>
										<DateRangePicker
											format="DD/MM/YYYY"
											label="Período de Referência"
											value={referencia}
											onChange={referencia => setReferencia(referencia)} />
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions>
								<Button variant="contained" color="primary" onClick={submit}>
									Gerar Analise
								</Button>
							</CardActions>
						</Card>
					</Grid>

					{loading === true && (
						<Grid item xs={12}>
							<TableContainer component={Paper} className={classes.tableResponsive}>
								<TableSort rows={relatorio.produtos || []}
									footer={<FooterTable relatorio={relatorio} />}
								>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 100, maxWidth: 160 }}
										field="produto.codigo" title="Código"
									/>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 200 }}
										field="produto.descricao" title="Descrição"
									/>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 125 }}
										field="produto.marca" title="Marca"
									/>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 125 }}
										field="produto.categoria.nome" title="Categoria"
									/>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 125 }}
										field="produto.departamento.nome" title="Departamento"
									/>
									<TableSortColumn rowNumber={1} rowSpanHead={4} styleHead={{ minWidth: 125 }}
										field="curva" title="Curva"
									/>

									<TableSortColumn rowNumber={1} colSpanHead={4} classHead={classes.columnSpanRef}
										classBody={classes.columnSpanRef} align="center" disabled title="Periodo Referencia (VENDA REG.)" />
									<TableSortColumn rowNumber={1} colSpanHead={4} classHead={classes.columnSpanAcao}
										classBody={classes.columnSpanAcao} align="center" disabled title="Periodo Ação (VENDA OF.)" />
									<TableSortColumn rowNumber={1} colSpanHead={4} classHead={classes.columnSpanPef}
										classBody={classes.columnSpanPef} align="center" disabled title="Comparativo de Performace" />

									{customColumns(relatorio).map((r, k) => {
										return (
											<React.Fragment key={k} >
												<TableSortColumn
													rowNumber={2}
													field={`${r.field}.quantidade`} title="Qtd"
													styleHead={{ backgroundColor: r.cor, minWidth: 125 }}
													styleBody={{ backgroundColor: r.cor }}
													formatter={(field) => `${numberFormat(field, DECIMAIS.QUANTIDADES)}`}
												/>

												<TableSortColumn
													rowNumber={2}
													field={`${r.field}.valor`} title="Valor"
													styleHead={{ backgroundColor: r.cor, minWidth: 125 }}
													styleBody={{ backgroundColor: r.cor }}
													formatter={(field) => `${numberFormat(field, DECIMAIS.VALOR)}`}
												/>

												<TableSortColumn
													rowNumber={2}
													field={`${r.field}.lucro`} title="Lucro"
													styleHead={{ backgroundColor: r.cor, minWidth: 125 }}
													styleBody={{ backgroundColor: r.cor }}
													formatter={(field) => `${numberFormat(field, DECIMAIS.VALOR)}`}
												/>

												<TableSortColumn
													rowNumber={2}
													field={`${r.field}.lucro_percentual`} title="% Lucro"
													styleHead={{ backgroundColor: r.cor, minWidth: 125 }}
													styleBody={{ backgroundColor: r.cor }}
													formatter={(field) => `${numberFormat(field, DECIMAIS.PERCENTUAL)}%`}
												/>
											</React.Fragment>
										);
									})}

								</TableSort>
							</TableContainer>
						</Grid>
					)}

					{loading === true && <Graficos analise={analisePerformanceParams} />}
				</Grid>
			</Container>
		</Page>
	);
}

export default Relatorio;