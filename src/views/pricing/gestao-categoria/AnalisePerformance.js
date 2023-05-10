import React, { useState, useEffect } from 'react';

import {
	Container, Card, CardContent,
	CardHeader, Grid, CardActions,
	Divider, Button, TableContainer,
	Paper, TableRow, TableCell, makeStyles,
	colors, Tab, Tabs, Typography, TableFooter
} from '@material-ui/core';

import { Autocomplete } from '@material-ui/lab';

import Page from '../../../components/Page';
import { DateRangePicker, TextField, TableSort, TableSortColumn } from '../../../components/material';
import { UnidadeAPI, DepartamentoAPI, CategoriaAPI, defaultProcessCatch, GestaoCategoriaAPI } from '../../../services/api';
import { numberFormat, DECIMAIS } from '../../../utils/formats/number';
import { showLoading } from '../../../utils/loading';

const useStyles = makeStyles(() => ({
	tableResponsive: {
		'& table': {
			borderTop: '1px solid rgba(224, 224, 224, 1)',
			zoom: '80%',
		},
		overflowX: 'auto',
		'& table> thead> tr> th': {
			textTransform: 'uppercase',
		},
		'& table> thead> tr> th, &> table> thead> tr> td': {
			paddingRight: 0,
		},
		'& table td.variacao-down': {
			color: '#f8514d',
			backgroundColor: '#fcc9cf',
		},
		'& table td.variacao-up': {
			color: '#387342',
			backgroundColor: '#c4e2cc',
		},
	},

	columnSpanRef: {
		backgroundColor: colors.yellow[300],
		paddingRight: 16,
		borderBottom: 'none',
	},
	columnSpanAcao: {
		backgroundColor: colors.blue[300],
		paddingRight: 16,
		borderBottom: 'none',
	},
	columnSpanPef: {
		backgroundColor: colors.green[300],
		paddingRight: 16,
		borderBottom: 'none',
	},
	footerResult: {
		'& td': {
			fontSize: '1rem',
			fontWeight: 600,
			color: '#111',
		}
	},
	cellAlone: {
		borderRight: '1px solid rgba(224, 224, 224, 1)',
		borderLeft: '1px solid rgba(224, 224, 224, 1)',
	}
}));

const tabs = {
	ANALISE: 0,
	CATEGORIA: 1,
	DESEMPENHO: 2,
}

const customColumns = (periodo) => {
	if (!periodo) return [];
	return [
		{
			cor: colors.yellow[200],
			periodo: periodo.referencia,
			field: 'referencia',
		},
		{
			cor: colors.blue[200],
			periodo: periodo.analise,
			field: 'analise',
		},
		{
			cor: colors.green[200],
			periodo: periodo.comparativo,
			field: 'comparativo',
		},
	];
}

const TabAnalise = ({ performance }) => {
	const classes = useStyles();
	const { categorias = [], departamentos = [], unidades = [], grupo = {} } = performance || {};

	return (
		<Grid item xs={12}>
			<TableContainer className={classes.tableResponsive}>
				<TableSort rows={categorias}>
					<TableSortColumn rowNumber={1} field="categoria.codigo" title="Código"
						rowSpanHead={2} styleHead={{ minWidth: 100, maxWidth: 160 }}
					/>
					<TableSortColumn rowNumber={1} field="categoria.nome" title="Descrição"
						rowSpanHead={2} styleHead={{ minWidth: 200 }}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO REFERÊNCIA" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanRef}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO ANÁLISE" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanAcao}
					/>
					<TableSortColumn rowNumber={1} title="COMPARATIVO" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanPef}
					/>

					{customColumns(performance).map((c, k) => {
						return (
							<React.Fragment key={k}>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.quantidade`} title="Quantidade"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.QUANTIDADES)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.valor_venda`} title="Venda"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.custo`} title="CMV"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro`} title="Lucro"
									styleHead={{ minWidth: 145 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro_percentual`} title="% Lucro"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.MARGEM_LUCRO)}`}
								/>
							</React.Fragment>
						)
					})}
				</TableSort>
			</TableContainer>

			<div style={{ backgroundColor: colors.blue[600], height: 56, display: 'flex', marginTop: 16 }}>
				<Typography style={{ color: '#fff', fontWeight: 600, margin: 'auto' }} variant="subtitle2">
					DESEMPENHO DEPARTAMENTOS
				</Typography>
			</div>

			<TableContainer className={classes.tableResponsive}>
				<TableSort rows={departamentos}>
					<TableSortColumn rowNumber={1} field="departamento.codigo" title="Código"
						rowSpanHead={2} styleHead={{ minWidth: 100, maxWidth: 160 }}
					/>
					<TableSortColumn rowNumber={1} field="departamento.nome" title="Descrição"
						rowSpanHead={2} styleHead={{ minWidth: 200 }}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO REFERÊNCIA" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanRef}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO ANÁLISE" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanAcao}
					/>
					<TableSortColumn rowNumber={1} title="COMPARATIVO" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanPef}
					/>

					{customColumns(performance).map((c, k) => {
						return (
							<React.Fragment key={k}>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.quantidade`} title="Quantidade"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.QUANTIDADES)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.valor_venda`} title="Venda"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.custo`} title="CMV"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro`} title="Lucro"
									styleHead={{ minWidth: 145 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro_percentual`} title="% Lucro"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.MARGEM_LUCRO)}`}
								/>
							</React.Fragment>
						)
					})}
				</TableSort>
			</TableContainer>

			<div style={{ backgroundColor: colors.blue[600], height: 56, display: 'flex', marginTop: 16 }}>
				<Typography style={{ color: '#fff', fontWeight: 600, margin: 'auto' }} variant="subtitle2">
					DESEMPENHO LOJAS
				</Typography>
			</div>

			<TableContainer className={classes.tableResponsive}>
				<TableSort rows={unidades}>
					<TableSortColumn rowNumber={1} field="unidade.codigo" title="Código"
						rowSpanHead={2} styleHead={{ minWidth: 100, maxWidth: 160 }}
					/>
					<TableSortColumn rowNumber={1} field="unidade.nome" title="Descrição"
						rowSpanHead={2} styleHead={{ minWidth: 200 }}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO REFERÊNCIA" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanRef}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO ANÁLISE" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanAcao}
					/>
					<TableSortColumn rowNumber={1} title="COMPARATIVO" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanPef}
					/>

					{customColumns(performance).map((c, k) => {
						return (
							<React.Fragment key={k}>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.quantidade`} title="Quantidade"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.QUANTIDADES)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.valor_venda`} title="Venda"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.custo`} title="CMV"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro`} title="Lucro"
									styleHead={{ minWidth: 145 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`stats.${c.field}.lucro_percentual`} title="% Lucro"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.MARGEM_LUCRO)}`}
								/>
							</React.Fragment>
						)
					})}
				</TableSort>
			</TableContainer>

			<div style={{ backgroundColor: colors.blue[600], height: 56, display: 'flex', marginTop: 16 }}>
				<Typography style={{ color: '#fff', fontWeight: 600, margin: 'auto' }} variant="subtitle2">
					DESEMPENHO GRUPO
				</Typography>
			</div>

			<TableContainer className={classes.tableResponsive}>
				<TableSort rows={[grupo]}>
					<TableSortColumn rowNumber={1} title="PERÍODO REFERÊNCIA" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanRef}
					/>
					<TableSortColumn rowNumber={1} title="PERÍODO ANÁLISE" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanAcao}
					/>
					<TableSortColumn rowNumber={1} title="COMPARATIVO" align="center"
						disabled colSpanHead={5} classHead={classes.columnSpanPef}
					/>

					{customColumns(performance).map((c, k) => {
						return (
							<React.Fragment key={k}>
								<TableSortColumn rowNumber={2} align="right" field={`${c.field}.quantidade`} title="Quantidade"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.QUANTIDADES)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`${c.field}.valor_venda`} title="Venda"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`${c.field}.custo`} title="CMV"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`${c.field}.lucro`} title="Lucro"
									styleHead={{ minWidth: 145 }}
									formatter={(field) => `R$ ${numberFormat(field, DECIMAIS.VALOR)}`}
								/>
								<TableSortColumn rowNumber={2} align="right" field={`${c.field}.lucro_percentual`} title="% Lucro"
									styleHead={{ minWidth: 125 }}
									formatter={(field) => `${numberFormat(field, DECIMAIS.MARGEM_LUCRO)}`}
								/>
							</React.Fragment>
						)
					})}
				</TableSort>
			</TableContainer>
		</Grid>
	)
}

const TabCategorias = ({ performance }) => {
	const classes = useStyles();
	const {
		categorias = [],
		grupo: {
			comparativo = {}, referencia = {},
			analise = {}, crescimento = 0, queda = 0,
		} = {},
	} = performance || {};

	const Footer = () => {
		return (
			<TableFooter className={classes.footerResult}>
				<TableRow>
					<TableCell colSpan={2}></TableCell>
					<TableCell align="right">
						R$ {numberFormat(comparativo.valor_venda, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right" className={variationValueStyle(comparativo.lucro, true)}>
						R$ {numberFormat(comparativo.lucro, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell colSpan={2}></TableCell>
					<TableCell align="right">
						R$ {numberFormat(referencia.valor_venda, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(analise.valor_venda, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(referencia.lucro, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(analise.lucro, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						{numberFormat(referencia.lucro_percentual, DECIMAIS.MARGEM_LUCRO)} %
					</TableCell>
					<TableCell align="right">
						{numberFormat(analise.lucro_percentual, DECIMAIS.MARGEM_LUCRO)} %
					</TableCell>
					<TableCell align="right" className={variationValueStyle(crescimento, true)}>
						R$ {numberFormat(crescimento, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right" className={variationValueStyle(queda, true)}>
						R$ {numberFormat(queda, DECIMAIS.VALOR)}
					</TableCell>
				</TableRow>
			</TableFooter>
		);
	}

	return (
		<Grid item xs={12}>
			<TableContainer className={classes.tableResponsive}>
				<TableSort size="small" rows={categorias} footer={<Footer />}>
					<TableSortColumn field="categoria.codigo" title="Código" width={120} />
					<TableSortColumn field="categoria.nome" title="Descrição" width={120} />
					<TableSortColumn align="right" field="stats.comparativo.valor_venda" title="Valor Venda Variação" width={180}
						formatter={(valor_venda) => `R$ ${numberFormat(valor_venda || 0, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.comparativo.lucro" title="Valor Lucro Variação" width={180}
						classBody={(lucro) => variationValueStyle(lucro, true)}
						formatter={(lucro) => `R$ ${numberFormat(lucro, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.comparativo.lucro_percentual" title="% Lucro" width={150}
						classBody={(_, c) => variationValueStyle(c.stats.comparativo.lucro, false)}
						formatter={(lucro_percentual) => `${numberFormat(lucro_percentual, DECIMAIS.MARGEM_LUCRO)} %`}
					/>
					<TableSortColumn align="right" title="Nº Dias" width={110}
						formatter={() => 0}
					/>
					<TableSortColumn align="right" field="stats.referencia.valor_venda" title="Venda A GC" width={220}
						formatter={(valor_venda) => `R$ ${numberFormat(valor_venda, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.analise.valor_venda" title="Venda D GC" width={220}
						formatter={(valor_venda) => `R$ ${numberFormat(valor_venda, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.referencia.lucro" title="Lucro A GC" width={200}
						formatter={(lucro) => `R$ ${numberFormat(lucro, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.analise.lucro" title="Lucro D GC" width={200}
						formatter={(lucro) => `R$ ${numberFormat(lucro, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn align="right" field="stats.referencia.lucro_percentual" title="% Lucro A GC" width={180}
						formatter={(lucro_percentual) => `${numberFormat(lucro_percentual, DECIMAIS.MARGEM_LUCRO)} %`}
					/>
					<TableSortColumn align="right" field="stats.analise.lucro_percentual" title="% Lucro D GC" width={180}
						formatter={(lucro_percentual) => `${numberFormat(lucro_percentual, DECIMAIS.MARGEM_LUCRO)} %`}
					/>
					<TableSortColumn align="right" field="stats.crescimento" title="Crescimento" width={200}
						formatter={(crescimento) => crescimento > 0
							? `R$ ${numberFormat(crescimento, DECIMAIS.VALOR)}` : '-'}
					/>
					<TableSortColumn align="right" field="stats.queda" title="Queda" width={200}
						formatter={(queda) => queda < 0
							? `R$ ${numberFormat(queda, DECIMAIS.VALOR)}` : '-'}
					/>
				</TableSort>
			</TableContainer>
		</Grid>
	);
}

const TabDesempenho = ({ performance = {} }) => {
	const classes = useStyles();
	const resumo = performance.resumo_desempenho || [];

	return (
		<TableContainer className={classes.tableResponsive}>
			<TableSort rows={resumo} >
				<TableSortColumn rowNumber={1} colSpanHead={2} title=" " />
				<TableSortColumn rowNumber={1} colSpanHead={3} title="Variação" align="center" styleHead={{ borderBottom: '2px solid #000' }} />
				<TableSortColumn rowNumber={1} colSpanHead={2} title=" " />

				<TableSortColumn rowNumber={2} width={110} field="categoria.codigo" title="Código"
					classBody={(_, r) => variationValueStyle(r.positivo === true)}
				/>
				<TableSortColumn rowNumber={2} width={260} field="categoria.nome" title="Descrição" />
				<TableSortColumn rowNumber={2} width={170} field="variacao_valor_venda" title="Valor Venda" align="right"
					formatter={(variacao_valor_venda) => `R$ ${numberFormat(variacao_valor_venda, DECIMAIS.VALOR)}`}
				/>
				<TableSortColumn rowNumber={2} width={170} field="variacao_valor_lucro" title="Valor Lucro" align="right"
					classBody={(variacao_valor_lucro) => variationValueStyle(variacao_valor_lucro > 0)}
					formatter={(variacao_valor_lucro) => `R$ ${numberFormat(variacao_valor_lucro, DECIMAIS.VALOR)}`}
				/>
				<TableSortColumn rowNumber={2} width={130} field="variacao_percentual_lucro" title="% Lucro" align="right"
					classBody={(variacao_percentual_lucro) => variationValueStyle(variacao_percentual_lucro > 0)}
					formatter={(variacao_percentual_lucro) => `${numberFormat(variacao_percentual_lucro, DECIMAIS.MARGEM_LUCRO)}%`}
				/>
				<TableSortColumn rowNumber={2} width={100} field="quantidade_dias" title="Nº Dias" />
				<TableSortColumn rowNumber={2} field="justificativa" title="Justificativa" />
			</TableSort>
		</TableContainer>
	)
}

const AnalisePerformance = () => {
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({
		unidades: [],
		departamentos: [],
		categorias: [],
	});
	const [tab, setTab] = useState(tabs.ANALISE);
	const [unidades, setUnidades] = useState([]);
	const [departamentos, setDepartamentos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [periodoAnalise, setPeriodoAnalise] = useState([]);
	const [periodoReferencia, setPeriodoReferencia] = useState([]);
	const [performance, setPerformance] = useState(null);

	const gerarAnalise = () => {
		setLoading(true);
		showLoading(
			'Gerando análise de performance...',
			GestaoCategoriaAPI.gerarAnalisePerformance(
				{
					analise: { inicio: periodoAnalise[0], fim: periodoAnalise[1] },
					referencia: { inicio: periodoReferencia[0], fim: periodoReferencia[1] },
					unidades: form.unidades.map(u => u.uuid),
					departamentos: form.departamentos.map(d => d.uuid),
					categorias: form.categorias.map(c => c.uuid),
				})
				.finally(() => setLoading(false))
				.then(rs => setPerformance(rs))
		);
	}

	useEffect(() => {
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
		DepartamentoAPI.list()
			.then(rs => setDepartamentos(rs.departamentos || []))
			.catch(defaultProcessCatch());
		CategoriaAPI.list()
			.then(rs => setCategorias(rs.categorias || []))
			.catch(defaultProcessCatch());
	}, []);

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	return (
		<Page title="Análise de performace">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={12}>
						<Card>
							<CardHeader title="Análise de performance" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={4}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.unidades}
											options={unidades}
											onChange={(_, unidades) => changeField({ unidades })}
											getOptionLabel={option => `${option.codigo} - ${option.nome}`}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Unidades" />
											)}
										/>
									</Grid>
									<Grid item xs={4}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.departamentos}
											options={departamentos}
											onChange={(_, departamentos) => changeField({ departamentos })}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Departamentos" />
											)}
										/>
									</Grid>
									<Grid item xs={4}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.categorias}
											options={categorias}
											onChange={(_, categorias) => changeField({ categorias })}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Categorias" />
											)}
										/>
									</Grid>
									<Grid item xs={6}>
										<DateRangePicker
											format="DD/MM/YYYY"
											label="Período de Referência"
											value={periodoReferencia}
											onChange={referencia => setPeriodoReferencia(referencia)} />
									</Grid>
									<Grid item xs={6}>
										<DateRangePicker
											format="DD/MM/YYYY"
											label="Período de Análise"
											value={periodoAnalise}
											onChange={analise => setPeriodoAnalise(analise)} />
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions>
								<Button variant="contained" color="primary" onClick={() => gerarAnalise()}>
									Gerar Análise
								</Button>
							</CardActions>
						</Card>
					</Grid>

					{loading === true ? null : (
						<Grid item xs={12}>
							<Paper>
								<Tabs value={tab}>
									<Tab onClick={() => setTab(tabs.ANALISE)} label="Análise de Performance" />
									<Tab onClick={() => setTab(tabs.CATEGORIA)} label="Resumo de Categorias" />
									<Tab onClick={() => setTab(tabs.DESEMPENHO)} label="Resumo de Desempenho" />
								</Tabs>
								{tabs.ANALISE === tab && <TabAnalise performance={performance} />}
								{tabs.CATEGORIA === tab && <TabCategorias performance={performance} />}
								{tabs.DESEMPENHO === tab && <TabDesempenho performance={performance} />}
							</Paper>
						</Grid>
					)}
				</Grid>
			</Container>
		</Page>
	);
}

export default AnalisePerformance;

function variationValueStyle(state) {
	if (state === true) return 'variacao-up';
	if (state === false) return 'variacao-down';
	return '';
}