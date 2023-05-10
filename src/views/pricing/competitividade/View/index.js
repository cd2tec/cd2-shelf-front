import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import {
	makeStyles, Container, TableContainer, Grid,
	TableCell, Paper, Card, CardContent,
	CardHeader, colors, Tab, Tabs, IconButton, Button,
	Dialog, DialogTitle, List, ListItem, ListItemText,
	Divider, DialogActions, DialogContent, Typography, MenuItem,
} from '@material-ui/core';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { Bar, Line } from 'react-chartjs-2';

import Page from '../../../../components/Page';
import { PesquisaAPI, defaultProcessCatch, PesquisaEtapa, InicializarPrecosRequestModo } from '../../../../services/api';

import PesquisaPrecosConcorrentes from './PesquisaPrecosConcorrentes';
import { Checkbox, TableSort, TableSortColumn, SelectField } from '../../../../components/material';
import { customNumberFormat, DECIMAIS } from '../../../../utils/formats';
import EdicaoPrecoField from '../../../produtos/EdicaoPrecoDialog/EdicaoPrecoField';
import alerts from '../../../../utils/alerts';
import { showLoading } from '../../../../utils/loading';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		height: '100%',
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(3),
	},
	actions: {
		textAlign: 'right',
	},
	tableResponsive: {
		overflowX: 'auto',
		'& table > thead > tr > th': {
			textTransform: 'uppercase',
		},
	},
	chartContent: {
		padding: '20px 0px',
		height: 250,
	},
	columnConcorrente: {
		backgroundColor: colors.grey[200],
		paddingRight: 16,
	},
	tabs: {
		marginBottom: theme.spacing(2),
	},
	rowExpanded: {
		backgroundColor: colors.grey[300],
		'& > td.concorrente': {
			backgroundColor: colors.grey[400],
		},
	},
}));

const numberFormat = valor => customNumberFormat(valor, { minDecimals: 2, maxDecimals: 2 })

const InicializacaoPrecos = ({ pesquisa, concorrentes = [], onClose }) => {
	const [modo, setModo] = useState({
		modo: InicializarPrecosRequestModo.UNDEFINED,
		concorrente_uuid: undefined,
	});
	const [margemMinima, setMargemMinima] = useState(true);
	const [ajustePreco, setAjustePreco] = useState(true);

	const selectOption = (modo, concorrente_uuid) => setModo({ modo, concorrente_uuid })

	const handleSubmit = () => {
		if (modo.modo === InicializarPrecosRequestModo.UNDEFINED) {
			alerts.warning('Inicialização de Preços Sugeridos', 'Por favor, selecione um modo de inicialização de preço');
			return;
		}

		showLoading(
			'Inicializando preços, aguarde',
			PesquisaAPI.inicializarPrecos(pesquisa.uuid,
				{ ...modo, bloquear_margem_minima: margemMinima, aplicar_ajuste_preco: ajustePreco })
				.then(() => {
					alerts.snackbars.success('Inicialização realizada com sucesso, atualizando valores');
					setTimeout(() => onClose(true), 500);
				})
				.catch(defaultProcessCatch()));
	}

	return (
		<Dialog fullWidth maxWidth="md" open={true} onClose={() => onClose()}>
			<DialogTitle>Inicialização de Preços Sugeridos</DialogTitle>

			<List>
				<ListItem button
					selected={modo.modo === InicializarPrecosRequestModo.MENORPRECO}
					onClick={() => selectOption(InicializarPrecosRequestModo.MENORPRECO)}>
					<ListItemText primary="Menor Preço" />
				</ListItem>
				<ListItem button
					selected={modo.modo === InicializarPrecosRequestModo.MAIORPRECO}
					onClick={() => selectOption(InicializarPrecosRequestModo.MAIORPRECO)}>
					<ListItemText primary="Maior Preço" />
				</ListItem>

				<Divider />

				{concorrentes.map(c => (
					<ListItem key={c.uuid} button
						selected={modo.modo === InicializarPrecosRequestModo.CONCORRENTE && modo.concorrente_uuid === c.uuid}
						onClick={() => selectOption(InicializarPrecosRequestModo.CONCORRENTE, c.uuid)}>
						<ListItemText primary={`Concorrente Referencial: ${c.nome}`} />
					</ListItem>
				))}
			</List>
			<DialogActions>
				<div style={{ marginLeft: 8 }}>
					<Checkbox
						label="Respeitar Margem Mínima"
						value={margemMinima}
						onChange={() => setMargemMinima(!margemMinima)} />

					<Checkbox
						label="Aplicar Ajuste de Preço"
						value={ajustePreco}
						onChange={() => setAjustePreco(!ajustePreco)} />
				</div>

				<Button onClick={() => onClose()} style={{ marginLeft: 'auto' }}>Cancelar</Button>
				<Button variant="outlined" color="primary" onClick={handleSubmit}>Inicializar</Button>
			</DialogActions>
		</Dialog>
	);
}

const CompetitividadePrecos = ({ pesquisa }) => {
	const classes = useStyles();
	const [unidade, setUnidade] = useState(null);
	const [expanded, setExpanded] = useState(false);
	const [valoresConcorrentes, setValoresConcorrentes] = useState({});
	const [valoresUnidades, setValoresUnidades] = useState({});
	const [showAllProdutos, setShowAllProdutos] = useState(false);
	const [dialog, setDialog] = useState();

	const { produtos = [], concorrentes = [], unidades = [] } = pesquisa || {};
	const outrasUnidades = unidade && unidades.length > 1
		? unidades.filter(u => u.unidade.cnpj !== unidade.cnpj) : [];

	const reloadPrecos = useCallback(() => {
		showLoading(
			'Carregando produtos',
			PesquisaAPI.getValoresProdutos(pesquisa.uuid)
				.then(rs => {
					let valoresConcorrentes = {};
					let valoresUnidades = {};

					for (const v of rs.concorrentes || []) {
						valoresConcorrentes[`${v.concorrente.uuid}_${v.produto_unidade.produto.uuid}`] = {
							preco_venda: v.preco_venda,
							margem_venda: v.margem_venda,
							lucro: v.lucro,
						};
					}

					for (const v of rs.unidades || []) {
						const pu = v.produto_unidade;
						valoresUnidades[pu.produto.uuid] = {
							unidade: pu.unidade,

							preco_compra: pu.preco_compra,
							custo_total: pu.custo_total,
							margem_ideal: pu.margem,
							preco_sugerido: pu.preco_sugerido,

							margem_atual: pu.margem_atual,
							preco_venda: v.preco_venda,

							em_oferta: pu.oferta.ativo,
							oferta_inicio: pu.oferta.data_inicial,
							oferta_fim: pu.oferta.data_final,
							has_pesquisa: !!v.has_pesquisa,
						};
					}

					setValoresConcorrentes(valoresConcorrentes);
					setValoresUnidades(valoresUnidades);

				})
				.catch(defaultProcessCatch()));
	}, [pesquisa]);

	useEffect(() => {
		if (unidade || unidades.length < 1) return;
		setUnidade(unidades[0].unidade);
	}, [unidade, unidades]);

	useEffect(() => {
		reloadPrecos();
	}, [reloadPrecos, pesquisa]);

	const inicializarPrecos = () => setDialog(
		<InicializacaoPrecos
			pesquisa={pesquisa}
			concorrentes={concorrentes}
			onClose={hasChanges => {
				setDialog();
				if (hasChanges) {
					reloadPrecos();
				}
			}} />
	)

	const renderBarConcorrentes = () => {
		let labels = [];
		let dsMaior = {
			label: 'Maior Preço',
			data: [],
			backgroundColor: colors.green[500]
		};
		let dsIgual = {
			label: 'Preço Igual',
			data: [],
			backgroundColor: colors.grey[500]
		};
		let dsMenor = {
			label: 'Menor Preço',
			data: [],
			backgroundColor: colors.red[500]
		};

		for (const c of concorrentes) {
			let qtdMaior = 0;
			let qtdMenor = 0;
			let qtdIgual = 0;
			for (const p of produtos) {
				const vu = valoresUnidades[p.uuid];
				if (!vu || !vu.has_pesquisa) continue;

				const vc = valoresConcorrentes[`${c.uuid}_${p.uuid}`];
				const precoConcorrente = vc && vc.preco_venda ? vc.preco_venda || 0 : 0;
				if (precoConcorrente <= 0) continue;

				const precoUnidade = vu.preco_venda || 0;

				if (precoUnidade > precoConcorrente) {
					qtdMaior++;
				} else if (precoUnidade < precoConcorrente) {
					qtdMenor++;
				} else {
					qtdIgual++;
				}
			}

			labels.push(c.nome);
			dsMaior.data.push(qtdMaior);
			dsMenor.data.push(qtdMenor);
			dsIgual.data.push(qtdIgual);
		}

		const DialogPrecosConcorrente = ({ onClose, produtos = [], concorrente }) => {
			const FILTROS = {
				TODOS: -1,
				MAIOR_PRECO: 1,
				MENOR_PRECO: 2,
				IGUAL: 3,
			};

			const [filtro, setFiltro] = useState(FILTROS.TODOS);

			produtos = produtos.filter(p => {
				const vu = valoresUnidades[p.uuid]
				const vc = valoresConcorrentes[`${concorrente.uuid}_${p.uuid}`];
				return vu && vu.has_pesquisa && !!vc.preco_venda;
			});

			produtos = produtos.filter(p => {
				const vu = valoresUnidades[p.uuid];
				const vc = valoresConcorrentes[`${concorrente.uuid}_${p.uuid}`];
				if (FILTROS.MAIOR_PRECO === filtro) return vu.preco_venda > vc.preco_venda;
				if (FILTROS.MENOR_PRECO === filtro) return vu.preco_venda < vc.preco_venda;
				if (FILTROS.IGUAL === filtro) return vu.preco_venda === vc.preco_venda;
				return true;
			});

			return (
				<Dialog open={true} maxWidth="lg" fullWidth >
					<DialogTitle disableTypography>
						<Grid container spacing={2} >
							<Grid item xs={9} >
								<Typography variant="h6" >Concorrente: {concorrente.nome}</Typography>
							</Grid>
							<Grid item xs={3} >
								<SelectField name="filtro" value={filtro} onChange={v => setFiltro(v)} label="Filtro" size="small" >
									<MenuItem value={FILTROS.TODOS} >Todos</MenuItem>
									<MenuItem value={FILTROS.MAIOR_PRECO} >Maior Preço</MenuItem>
									<MenuItem value={FILTROS.MENOR_PRECO} >Menor Preço</MenuItem>
									<MenuItem value={FILTROS.IGUAL} >Igual</MenuItem>
								</SelectField>
							</Grid>
						</Grid>
					</DialogTitle>
					<DialogContent style={{ padding: 0 }} >
						<TableSort rows={produtos} stickyHeader >
							<TableSortColumn rowNumber={1} title=" " colSpanHead={5} disabled />
							<TableSortColumn rowNumber={1} colSpanHead={3} align="center" classHead={classes.columnConcorrente} title="Concorrente" disabled />

							<TableSortColumn rowNumber={2} field="codigo" title="Código" style={{ minWidth: 100, maxWidth: 160 }} />
							<TableSortColumn rowNumber={2} field="codigo_barra" title="Código de Barras" style={{ minWidth: 100, maxWidth: 160 }} />
							<TableSortColumn rowNumber={2} field="descricao" title="Descrição" style={{ minWidth: 200 }} />
							<TableSortColumn rowNumber={2} field="preco_venda" title="Preço Atual" align="right" style={{ minWidth: 125 }}
								formatter={(_, p) => `R$ ${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].preco_venda || 0 : 0, DECIMAIS.VALOR)}`}
							/>
							<TableSortColumn rowNumber={2} field="margem_atual" title="% Margem Atual" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
								formatter={(_, p) => `${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].margem_atual || 0 : 0, DECIMAIS.MARGEM_LUCRO)}%`}
							/>

							<TableSortColumn rowNumber={2} field=" " title="Preço Venda"
								style={{ minWidth: 150 }} classBody={classes.columnConcorrente} classHead={classes.columnConcorrente}
								formatter={(_, p) => {
									const v = valoresConcorrentes[`${concorrente.uuid}_${p.uuid}`];
									return v && v.preco_venda ? `R$ ${numberFormat(v.preco_venda, DECIMAIS.VALOR)}` : '-';
								}}
							/>

							<TableSortColumn rowNumber={2} field=" " title="Margem" classHead={classes.columnConcorrente}
								style={{ minWidth: 125 }} classBody={classes.columnConcorrente}
								formatter={(_, p) => {
									const v = valoresConcorrentes[`${concorrente.uuid}_${p.uuid}`];
									return v && v.margem_venda ? `${numberFormat(v.margem_venda, DECIMAIS.MARGEM_LUCRO)}%` : '-';
								}}
							/>

							<TableSortColumn rowNumber={2} field=" " title="Lucro" classHead={classes.columnConcorrente}
								style={{ minWidth: 125 }} classBody={classes.columnConcorrente}
								formatter={(_, p) => {
									const v = valoresConcorrentes[`${concorrente.uuid}_${p.uuid}`];
									return v && v.lucro ? `R$ ${numberFormat(v.lucro, DECIMAIS.VALOR)}` : '-';
								}}
							/>
						</TableSort>
					</DialogContent>
					<DialogActions>
						<Button onClick={onClose} >Fechar</Button>
					</DialogActions>
				</Dialog>
			)
		}

		return (
			<Bar
				data={{
					labels,
					datasets: [dsMaior, dsMenor, dsIgual],
				}}
				options={{
					tooltips: { mode: 'label' },
					scales: {
						xAxes: [
							{
								stacked: true,
								ticks: {
									precision: 0,
									beginAtZero: true
								},
							},
						],
						yAxes: [
							{
								stacked: true,
								ticks: {
									precision: 0,
									beginAtZero: true
								},
							},
						],
					},
					maintainAspectRatio: false,
					responsive: true,
				}}
				onElementsClick={
					element => {
						if (!!element[0]) {
							const index = element[0]._index;
							const concorrente = concorrentes[index];
							setDialog(<DialogPrecosConcorrente produtos={produtos} concorrente={concorrente} onClose={() => setDialog(null)} />)
						}
					}
				}
			/>
		);
	}

	const renderBarPrecosProdutos = () => {
		let data = [];
		for (const p of produtos) {
			const vu = valoresUnidades[p.uuid];
			if (!vu || !vu.has_pesquisa) continue;

			const precoUnidade = vu && vu.preco_venda ? vu.preco_venda || 0 : 0;
			data.push(precoUnidade);
		}

		let labels = [];
		let datasets = [
			{
				label: 'Unidade Atual',
				data: data,
				backgroundColor: colors.green[300],
				showLine: false
			}
		];


		labels = produtos.filter(p => {
			const vu = valoresUnidades[p.uuid];
			return vu && vu.has_pesquisa;
		}).map(p => p.descricao);
		for (const c of concorrentes) {
			let data = [];

			for (const p of produtos) {
				const vc = valoresConcorrentes[`${c.uuid}_${p.uuid}`];
				const precoConcorrente = vc && vc.preco_venda ? vc.preco_venda || 0 : 0;
				if (precoConcorrente > 0) {
					data.push(precoConcorrente);
				}
			}

			datasets.push({
				label: c.nome,
				data: data,
				backgroundColor: colors.red[300],
				showLine: false
			});
		}

		return (
			<Line
				data={{ labels, datasets }}
				options={{
					tooltips: {
						mode: 'label',
						callbacks: {
							label: function (tooltipItem, data) {
								let label = data.datasets[tooltipItem.datasetIndex].label || '';
								if (label) {
									label += ': ';
								}
								label += `R$ ${numberFormat(tooltipItem.yLabel)}`;
								return label;
							}
						}
					},
					interaction: {
						intersect: false,
					},
					scales: {
						yAxes: [
							{
								ticks: {
									beginAtZero: true,
									callback: v => `R$ ${numberFormat(v)}`,
								},
							},
						],
					},
					maintainAspectRatio: false,
					responsive: true,
				}} />
		);
	}

	const getRows = () => {
		if (showAllProdutos) {
			return produtos;
		}
		return produtos.filter(p => {
			const vu = valoresUnidades[p.uuid]
			return vu && vu.has_pesquisa;
		});
	}

	return (
		<Page className={classes.root}
			title={`Competitividade de Preços | Relatórios - ${unidade ? unidade.nome : 'Carregando...'}`}>
			<Container maxWidth={false}>
				{unidades.length && unidade ? (
					<Grid container={true} spacing={1}>
						<Grid item={true} xs={2} md={1} style={{ textAlign: 'center', paddingTop: 18 }}>
							<strong>UNIDADES:</strong>
						</Grid>
						<Grid item={true} xs={10} md={11}>
							<Tabs
								className={classes.tabs}
								value={unidade}
								onChange={(ev, value) => setUnidade(value)}
								indicatorColor="primary"
								textColor="primary"
								variant="scrollable"
								scrollButtons="auto">
								{unidades.map((u, index) => (
									<Tab key={index} label={u.unidade.nome} value={u.unidade} />
								))}
							</Tabs>
						</Grid>
					</Grid>
				) : null}

				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<Card>
							<CardHeader title="Concorrentes" />
							<CardContent className={classes.chartContent}>
								{renderBarConcorrentes()}
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={6}>
						<Card>
							<CardHeader title="Preços Produtos" />
							<CardContent className={classes.chartContent}>
								{renderBarPrecosProdutos()}
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} md={12}>
						<Card>
							<CardContent style={{ padding: 0 }}>
								<div style={{ margin: 16, display: 'flex' }}>
									<Button variant="outlined" color="secondary" onClick={inicializarPrecos} style={{ marginRight: 'auto' }}>
										Inicialização de Preços Sugeridos
									</Button>

									<Checkbox
										color="secondary"
										label="Mostrar produtos não pesquisados"
										value={showAllProdutos}
										onChange={() => setShowAllProdutos(!showAllProdutos)} />
								</div>

								<TableContainer component={Paper} className={classes.tableResponsive}>
									<TableSort size="small" rows={getRows()}>
										{!!outrasUnidades.length &&
											<TableSortColumn title="Unidade" rowSpanHead={2} style={expanded > 0 ? { minWidth: 150 } : {}}
												formatter={() => <TableCell>
													<IconButton size="small" onClick={() => setExpanded(!expanded)}>
														{expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
													</IconButton>
												</TableCell>}
											/>
										}
										<TableSortColumn rowNumber={1} field="codigo" title="Código" style={{ minWidth: 100, maxWidth: 160 }} rowSpanHead={2} />
										<TableSortColumn rowNumber={1} field="codigo_barra" title="Código de Barras" style={{ minWidth: 100, maxWidth: 160 }} rowSpanHead={2} />
										<TableSortColumn rowNumber={1} field="descricao" title="Descrição" style={{ minWidth: 200 }} rowSpanHead={2} />
										<TableSortColumn rowNumber={1} field="preco_compra" title="Preço de Compra" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `R$ ${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].preco_compra : 0, DECIMAIS.VALOR)}`}
										/>
										<TableSortColumn rowNumber={1} field="custo_total" title="Custo Total" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `R$ ${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].custo_total : 0, DECIMAIS.VALOR)}`}
										/>

										<TableSortColumn rowNumber={1} field="preco_venda" title="Preço Atual" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `R$ ${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].preco_venda || 0 : 0, DECIMAIS.VALOR)}`}
										/>

										<TableSortColumn rowNumber={1} field="preco_venda" title="Preço de Venda" style={{ minWidth: 175 }} rowSpanHead={2}
											formatter={(_, p) => {
												const vu = valoresUnidades[p.uuid];
												if (!vu) return null;

												return (
													valoresUnidades[p.uuid]
														? <EdicaoPrecoField
															produtoUUID={p.uuid}
															fluxoUUID={pesquisa.fluxo.uuid}
															unidadeUUID={vu.unidade.uuid}
															onChange={hasChanges => {
																if (hasChanges) reloadPrecos();
															}} />
														: null
												);
											}}
										/>
										<TableSortColumn rowNumber={1} field="margem_atual" title="% Margem Atual" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].margem_atual || 0 : 0, DECIMAIS.MARGEM_LUCRO)}%`}
										/>
										<TableSortColumn rowNumber={1} field="margem" title="% Margem Ideal" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].margem_ideal || 0 : 0, DECIMAIS.MARGEM_LUCRO)}%`}
										/>
										<TableSortColumn rowNumber={1} field="preco_sugerido" title="Preço Sugerido" align="right" style={{ minWidth: 125 }} rowSpanHead={2}
											formatter={(_, p) => `R$ ${numberFormat(valoresUnidades[p.uuid] ? valoresUnidades[p.uuid].preco_sugerido || 0 : 0, DECIMAIS.VALOR)}`}
										/>

										{concorrentes.map((c, index) => {
											return (
												<React.Fragment key={index}>
													<TableSortColumn rowNumber={1} key={index} title={c.nome || c.razao_social}
														align="center" style={{ minWidth: 125 }} colSpanHead={2} classHead={classes.columnConcorrente} />

													<TableSortColumn rowNumber={2} field="" title="Preço Venda"
														style={{ minWidth: 150 }} classBody={classes.columnConcorrente} classHead={classes.columnConcorrente}
														formatter={(_, p) => {
															const v = valoresConcorrentes[`${c.uuid}_${p.uuid}`];
															return v && v.preco_venda ? `R$ ${numberFormat(v.preco_venda, DECIMAIS.VALOR)}` : '-';
														}}
													/>
													<TableSortColumn rowNumber={2} field="" title="Margem" classHead={classes.columnConcorrente}
														style={{ minWidth: 125 }} classBody={classes.columnConcorrente}
														formatter={(_, p) => {
															const v = valoresConcorrentes[`${c.uuid}_${p.uuid}`];
															return v && v.margem_venda ? `${numberFormat(v.margem_venda, DECIMAIS.MARGEM_LUCRO)}%` : '-';
														}}
													/>
												</React.Fragment>
											);
										})}
									</TableSort>
								</TableContainer>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>

			{dialog}
		</Page>
	);
}

const Checker = () => {
	const { uuid: pesquisaUUID } = useParams();
	const [pesquisa, setPesquisa] = useState(null);

	useEffect(() => {
		if (!pesquisaUUID) return;

		PesquisaAPI.get(pesquisaUUID)
			.then(rs => setPesquisa(rs))
			.catch(defaultProcessCatch());
	}, [pesquisaUUID]);

	if (!pesquisa) return null;
	if (pesquisa.etapa === PesquisaEtapa.PESQUISA) {
		return (
			<PesquisaPrecosConcorrentes
				pesquisa={pesquisa}
				onIniciado={() => {
					PesquisaAPI.get(pesquisa.uuid)
						.then(rs => setPesquisa(rs))
						.catch(defaultProcessCatch());
				}} />
		);
	}

	return <CompetitividadePrecos pesquisa={pesquisa} />;
}

export default Checker;