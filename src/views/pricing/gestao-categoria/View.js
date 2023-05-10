import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

import {
	TableRow, TableCell,
	Container, makeStyles,
	Grid, Divider, Button, MenuItem,
	Card, CardHeader, CardContent, CardActions,
	Stepper, Step, StepButton, TableFooter, IconButton, Tooltip,
} from '@material-ui/core';

import { Visibility as ViewIcon } from '@material-ui/icons';

import Page from '../../../components/Page';
import {
	UnidadeAPI, DepartamentoAPI, GestaoCategoriaAPI,
	GestaoCategoriaRankingCurva,
	gestaoCategoriaRankingCurvaFormatoText,
	defaultProcessCatch, filterErrors, CurvaAPI, gestaoCategoriaStatusCategoria, CategoriaAPI,
} from '../../../services/api';
import { DateRangePicker, TextField, TableSort, TableSortColumn, Checkbox } from '../../../components/material';
import { Autocomplete } from '@material-ui/lab';
import alerts from '../../../utils/alerts';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import ViewCategoriaDialog from './ViewCategoriaDialog';
import { showLoading } from '../../../utils/loading';

const useStyles = makeStyles(() => ({
	cellPositivo: {
		color: 'green !important',
	},
	cellNegativo: {
		color: 'red !important',
	},
	A: {
		backgroundColor: '#CBDCB8 !important',
		color: 'black !important',
		fontSize: '1rem',
		fontWeight: 'bold'
	},
	B: {
		backgroundColor: '#C0D5EC !important',
		color: 'black !important',
		fontSize: '1rem',
		fontWeight: 'bold'
	},
	C: {
		backgroundColor: '#FEE49F !important',
		color: 'black !important',
		fontSize: '1rem',
		fontWeight: 'bold'
	},
	D: {
		backgroundColor: '#DBDBDB !important',
		color: 'black !important',
		fontSize: '1rem',
		fontWeight: 'bold'
	},
	E: {
		backgroundColor: '#F7CFB1 !important',
		color: 'black !important',
		fontSize: '1rem',
		fontWeight: 'bold'
	}
}));

function getStatusGC(gcc) {
	return gestaoCategoriaStatusCategoria(gcc && gcc.status && gcc.status.status ? gcc.status.status : '');
}

const ListaCategorias = ({ processo }) => {
	const classes = useStyles();
	const [curvas, setCurvas] = useState([]);
	const [dialog, setDialog] = useState();
	const [categoriasCurvas, setCategoriasCurvas] = useState({});
	const [step, setStep] = useState(0);
	const [unidades, setUnidades] = useState(processo.unidades || []);
	const [todasUnidades, setTodasUnidades] = useState([]);
	const [semMovimentacao, setSemMovimentacao] = useState(false);
	const [totais, setTotais] = useState({
		margem_ideal: 0,
		margem_media: 0,
		margem_minima: 0,
		margem_atual: 0,
		quantidade: 0,
		saldo_lucratividade: 0,
		valor_lucro: 0,
		valor_venda: 0,
	});
	const [filter, setFilter] = useState([])
	const [filterValue, setFilterValue] = useState()

	const reloadCategorias = useCallback(() => {
		showLoading('Carregando categorias...',
			GestaoCategoriaAPI.calcularCategoriasProcesso(processo.uuid, { unidades: unidades.map(u => u.uuid), sem_movimentacao: semMovimentacao })
				.then(rs => {
					setCategoriasCurvas(rs.curvas || {})
					setTotais({
						margem_ideal: rs.margem_ideal || 0,
						margem_media: rs.margem_media || 0,
						margem_minima: rs.margem_minima || 0,
						margem_atual: rs.margem_atual || 0,
						quantidade: rs.quantidade || 0,
						saldo_lucratividade: rs.saldo_lucratividade || 0,
						valor_lucro: rs.valor_lucro || 0,
						valor_venda: rs.valor_venda || 0,
					})

					getAllCategorias()
				})
				.catch(defaultProcessCatch()));
	}, [processo, unidades, semMovimentacao]);

	const onClickCategoria = (categoria, unidades, semMovimentacao) => {
		setDialog(
			<ViewCategoriaDialog
				processo={processo}
				categoria={categoria}
				unidades={unidades}
				semMovimentacao={semMovimentacao}
				onClose={hasChanges => {
					setDialog(null);
					if (hasChanges === true) reloadCategorias();
				}} />
		)
	}

	useEffect(() => {
		CurvaAPI.list()
			.then(rs => {
				let curvas = rs.curvas || [];
				if (semMovimentacao) {
					curvas.push({ letra: '' });
				}
				setCurvas(curvas);
			})
			.catch(defaultProcessCatch());
		UnidadeAPI.list()
			.then(rs => setTodasUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
	}, [semMovimentacao]);

	useEffect(() => {
		reloadCategorias();
	}, [reloadCategorias]);

	const getAllCategorias = () => {
		CategoriaAPI.list()
			.then(rs => setFilter(rs.categorias))
			.catch(defaultProcessCatch)
	}

	const getQtdCategoriasCurva = curva => {
		const { categorias = [] } = categoriasCurvas[curva] || {};
		return categorias.length;
	}

	const renderTable = () => {
		if (!curvas.length || !curvas[step]) {
			return null;
		}

		const {
			categorias = [], saldo_lucratividade, quantidade, valor_venda, valor_lucro,
			margem_minima, margem_ideal, margem_media, margem_atual
		} = categoriasCurvas[curvas[step].letra] || {};

		const addIndexInfo = (categorias) => {
			const total = categorias.length
			return categorias.map((c, posicao) => ({...c, posicao: posicao, total: total}))
		}

		return (
			<TableSort size="small" rows={addIndexInfo(categorias) || []}
				style={{ zoom: 0.85 }}
				footer={
					<TableFooter>
						<TableRow>
							<TableCell align="right" colSpan={3}></TableCell>
							<TableCell align="right" >
								{quantidade}
							</TableCell>
							<TableCell align="right" >
								R$ {numberFormat(valor_venda, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell align="right" >
								R$ {numberFormat(valor_lucro, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell align="right" >
								{numberFormat(margem_minima, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right" >
								{numberFormat(margem_ideal, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right"
								className={
									margem_media > margem_ideal
										? classes.cellPositivo
										: margem_media < margem_ideal
											? classes.cellNegativo
											: undefined
								}
							>
								{numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right"
								className={
									margem_atual > margem_ideal
										? classes.cellPositivo
										: margem_atual < margem_ideal
											? classes.cellNegativo
											: undefined
								}
							>
								{numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right" className={classes.cellNegativo}>
								R$ {numberFormat(saldo_lucratividade, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
						<TableRow>
							<TableCell align="right" colSpan={3}></TableCell>
							<TableCell align="right" >
								{totais.quantidade}
							</TableCell>
							<TableCell align="right" >
								R$ {numberFormat(totais.valor_venda, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell align="right" >
								R$ {numberFormat(totais.valor_lucro, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell align="right" >
								{numberFormat(totais.margem_minima, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right" >
								{numberFormat(totais.margem_ideal, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>
							<TableCell align="right"
								className={
									totais.margem_media > totais.margem_ideal
										? classes.cellPositivo
										: totais.margem_media < totais.margem_ideal
											? classes.cellNegativo
											: undefined
								}
							>
								{numberFormat(totais.margem_media, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>

							<TableCell align="right"
								className={
									totais.margem_atual > totais.margem_ideal
										? classes.cellPositivo
										: totais.margem_atual < totais.margem_ideal
											? classes.cellNegativo
											: undefined
								}
							>
								{numberFormat(totais.margem_atual, DECIMAIS.MARGEM_LUCRO)} %
							</TableCell>

							<TableCell align="right" className={classes.cellNegativo}>
								R$ {numberFormat(totais.saldo_lucratividade, DECIMAIS.VALOR)}
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableFooter>
				}
				renderRow={(row, dados) => {
					row.onClick = () => onClickCategoria(dados, unidades, semMovimentacao);
					return row;
				}}
			>
				<TableSortColumn
					width={30}
					field="curva"
					title="Curva"
					formatter={(_, row) => `${row.posicao + 1}`}
					classBody={() => {
						const stepToLetra = {
							0: 'A',
							1: 'B',
							2: 'C',
							3: 'D',
							4: 'E'
						}
						return classes[stepToLetra[step]]
					}}
					/>
				<TableSortColumn width={110} field="categoria.codigo" title="Código" />
				<TableSortColumn field="categoria.nome" title="Categoria" />
				<TableSortColumn width={210} field="departamento.nome" title="Departamento" />
				<TableSortColumn width={140} field="marcas_count" title="Qtd. Marcas" align="right" />

				<TableSortColumn width={160} field="valor_venda" title="R$ Venda" align="right"
					formatter={(valor_venda) => `R$ ${numberFormat(valor_venda, DECIMAIS.VALOR)}`} />

				<TableSortColumn width={160} field="valor_lucro" title="R$ Lucro" align="right"
					formatter={(valor_lucro) => `R$ ${numberFormat(valor_lucro, DECIMAIS.VALOR)}`} />

				<TableSortColumn width={110} field="margem_minima" title="Margem Mínima" align="right"
					formatter={(margem_minima) => `${numberFormat(margem_minima, DECIMAIS.MARGEM_LUCRO)}%`} />

				<TableSortColumn width={110} field="margem_ideal" title="Margem Ideal" align="right"
					formatter={(margem_ideal) => `${numberFormat(margem_ideal, DECIMAIS.MARGEM_LUCRO)}%`} />

				<TableSortColumn width={110} field="margem_media" title="Margem Média" align="right"
					classBody={(_, c) =>
						c.margem_media > c.margem_ideal
							? classes.cellPositivo
							: c.margem_media < c.margem_ideal
								? classes.cellNegativo
								: undefined
					}
					formatter={(margem_media) => `${numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)}%`} />

				<TableSortColumn width={110} field="margem_atual" title="Margem Atual" align="right"
					classBody={(_, c) =>
						c.margem_atual > c.margem_ideal
							? classes.cellPositivo
							: c.margem_atual < c.margem_ideal
								? classes.cellNegativo
								: undefined
					}
					formatter={(margem_atual) => `${numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)}%`} />

				<TableSortColumn width={160} field="saldo_lucratividade" title="Saldo Lucrativo" align="right"
					classBody={(_, c) => c.saldo_lucratividade > 0
						? classes.cellPositivo
						: c.saldo_lucratividade < 0
							? classes.cellNegativo
							: undefined
					}
					formatter={(saldo_lucratividade) => `R$ ${numberFormat(saldo_lucratividade, DECIMAIS.VALOR)}`} />

				<TableSortColumn width={60}
					formatter={(_, c) => {
						const [cor, texto] = getStatusGC(c);
						return (
							<IconButton
								style={{ color: cor }}
								size="small"
								onClick={() => onClickCategoria(c, unidades)}>
								<Tooltip title={texto} >
									<ViewIcon />
								</Tooltip>
							</IconButton>
						);
					}} />
			</TableSort>
		);
	}

	const tableFiltered = () => {
		let response = []
		let nome = filterValue
		let codigo
		if (filterValue.includes("-")) {
			const [c, n] = filterValue.split("-")
			codigo = c
			nome = n.toLowerCase().trim()
		}

		for (const [curva, categoria] of Object.entries(categoriasCurvas)) {
			const categoriaFiltrada = categoria.categorias.reduce((acc, cur, idx) => {
				if (codigo && cur.categoria.codigo.includes(codigo)) {
						acc.push({...cur, posicao: idx+1, curva, total: categoria.categorias.length})
						return acc
				}
				
				const nomeCategoria = cur.categoria.nome.toLowerCase()
				if (nome && nomeCategoria.includes(nome)) {
					acc.push({...cur, posicao: idx+1, curva, total: categoria.categorias.length})
					return acc
				}
				return acc
			}, [])
			response.push(categoriaFiltrada)
		}

			response = response.flat()
			return (
				<TableSort size="small" rows={response || []}
					style={{ zoom: 0.85 }}
					// footer={
					// 	<TableFooter>
					// 		<TableRow>
					// 			<TableCell align="right" colSpan={3}></TableCell>
					// 			<TableCell align="right" >
					// 				{quantidade}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				R$ {numberFormat(valor_venda, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				R$ {numberFormat(valor_lucro, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				{numberFormat(margem_minima, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				{numberFormat(margem_ideal, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right"
					// 				className={
					// 					margem_media > margem_ideal
					// 						? classes.cellPositivo
					// 						: margem_media < margem_ideal
					// 							? classes.cellNegativo
					// 							: undefined
					// 				}
					// 			>
					// 				{numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right"
					// 				className={
					// 					margem_atual > margem_ideal
					// 						? classes.cellPositivo
					// 						: margem_atual < margem_ideal
					// 							? classes.cellNegativo
					// 							: undefined
					// 				}
					// 			>
					// 				{numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right" className={classes.cellNegativo}>
					// 				R$ {numberFormat(saldo_lucratividade, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell></TableCell>
					// 		</TableRow>
					// 		<TableRow>
					// 			<TableCell align="right" colSpan={3}></TableCell>
					// 			<TableCell align="right" >
					// 				{totais.quantidade}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				R$ {numberFormat(totais.valor_venda, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				R$ {numberFormat(totais.valor_lucro, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				{numberFormat(totais.margem_minima, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right" >
					// 				{numberFormat(totais.margem_ideal, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
					// 			<TableCell align="right"
					// 				className={
					// 					totais.margem_media > totais.margem_ideal
					// 						? classes.cellPositivo
					// 						: totais.margem_media < totais.margem_ideal
					// 							? classes.cellNegativo
					// 							: undefined
					// 				}
					// 			>
					// 				{numberFormat(totais.margem_media, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
	
					// 			<TableCell align="right"
					// 				className={
					// 					totais.margem_atual > totais.margem_ideal
					// 						? classes.cellPositivo
					// 						: totais.margem_atual < totais.margem_ideal
					// 							? classes.cellNegativo
					// 							: undefined
					// 				}
					// 			>
					// 				{numberFormat(totais.margem_atual, DECIMAIS.MARGEM_LUCRO)} %
					// 			</TableCell>
	
					// 			<TableCell align="right" className={classes.cellNegativo}>
					// 				R$ {numberFormat(totais.saldo_lucratividade, DECIMAIS.VALOR)}
					// 			</TableCell>
					// 			<TableCell></TableCell>
					// 		</TableRow>
					// 	</TableFooter>
					// }
					renderRow={(row, dados) => {
						row.onClick = () => onClickCategoria(dados, unidades, semMovimentacao);
						return row;
					}}
				>
					<TableSortColumn
						width={30}
						field="curva"
						title="Curva"
						formatter={(val, row) => `${val}-${row.posicao}`}
						classBody={(v, _) => classes[v]}
						/>
					<TableSortColumn width={110} field="categoria.codigo" title="Código" />
					<TableSortColumn field="categoria.nome" title="Categoria" />
					<TableSortColumn width={210} field="departamento.nome" title="Departamento" />
					<TableSortColumn width={140} field="marcas_count" title="Qtd. Marcas" align="right" />
	
					<TableSortColumn width={160} field="valor_venda" title="R$ Venda" align="right"
						formatter={(valor_venda) => `R$ ${numberFormat(valor_venda, DECIMAIS.VALOR)}`} />
	
					<TableSortColumn width={160} field="valor_lucro" title="R$ Lucro" align="right"
						formatter={(valor_lucro) => `R$ ${numberFormat(valor_lucro, DECIMAIS.VALOR)}`} />
	
					<TableSortColumn width={110} field="margem_minima" title="Margem Mínima" align="right"
						formatter={(margem_minima) => `${numberFormat(margem_minima, DECIMAIS.MARGEM_LUCRO)}%`} />
	
					<TableSortColumn width={110} field="margem_ideal" title="Margem Ideal" align="right"
						formatter={(margem_ideal) => `${numberFormat(margem_ideal, DECIMAIS.MARGEM_LUCRO)}%`} />
	
					<TableSortColumn width={110} field="margem_media" title="Margem Média" align="right"
						classBody={(_, c) =>
							c.margem_media > c.margem_ideal
								? classes.cellPositivo
								: c.margem_media < c.margem_ideal
									? classes.cellNegativo
									: undefined
						}
						formatter={(margem_media) => `${numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)}%`} />
	
					<TableSortColumn width={110} field="margem_atual" title="Margem Atual" align="right"
						classBody={(_, c) =>
							c.margem_atual > c.margem_ideal
								? classes.cellPositivo
								: c.margem_atual < c.margem_ideal
									? classes.cellNegativo
									: undefined
						}
						formatter={(margem_atual) => `${numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)}%`} />
	
					<TableSortColumn width={160} field="saldo_lucratividade" title="Saldo Lucrativo" align="right"
						classBody={(_, c) => c.saldo_lucratividade > 0
							? classes.cellPositivo
							: c.saldo_lucratividade < 0
								? classes.cellNegativo
								: undefined
						}
						formatter={(saldo_lucratividade) => `R$ ${numberFormat(saldo_lucratividade, DECIMAIS.VALOR)}`} />
	
					<TableSortColumn width={60}
						formatter={(_, c) => {
							const [cor, texto] = getStatusGC(c);
							return (
								<IconButton
									style={{ color: cor }}
									size="small"
									onClick={() => onClickCategoria(c, unidades)}>
									<Tooltip title={texto} >
										<ViewIcon />
									</Tooltip>
								</IconButton>
							);
						}} />
				</TableSort>
			);
	}

	return (
		<Grid item xs={12}>
			<Card>
				<CardContent style={{ padding: 0 }}>
					<Grid container spacing={2} justify="flex-end">
						{processo.todas_unidades || (processo.unidades || []).length >= 1 ? (
							<Grid item xs>
								<div style={{ paddingLeft: 16, paddingRight: 16 }}>
									<Autocomplete
										multiple
										limitTags={4}
										value={unidades}
										options={processo.todas_unidades ? todasUnidades : processo.unidades}
										onChange={(_, unidades) => setUnidades((unidades || []).length ? unidades : processo.unidades)}
										getOptionLabel={option => option.codigo}
										getOptionSelected={(opt, value) => opt.uuid === value.uuid}
										renderInput={(params) => (
											<TextField {...params} variant="outlined" label="Unidades" />
										)}
									/>
								</div>
							</Grid>
						) : null}

						<Grid item xs={2} style={{ paddingTop: 32 }}>
							<Checkbox
								label="Sem movimentação"
								value={semMovimentacao}
								onChange={() => setSemMovimentacao(!semMovimentacao)} />
						</Grid>

					</Grid>

					<Grid item xs={5} style={{ margin: '0 0 0px 15px' }}>
						<Autocomplete
							clearOnBlur={false}
							inputValue={filterValue || ""}
							options={filter}
							onInputChange={(_, categorias) => setFilterValue(categorias)}
							getOptionLabel={option => `${option.codigo} - ${option.nome}`}
							renderOption={option => `${option.codigo} - ${option.nome}`}
							getOptionSelected={(opt, value) => opt.uuid === value.uuid}
							renderInput={(params) => (
								<TextField {...params} variant="outlined" label="Filtrar Categorias" />
							)}
						/>
					</Grid>

					{!filterValue ? <Stepper nonLinear activeStep={step} style={{marginBottom: '-30px'}}>
						{curvas.map((c, index) => (
							<Step key={index}>
								<StepButton onClick={() => setStep(index)}>
									{c.letra ? `Curva ${c.letra}` : 'Sem Movimentação'} ({getQtdCategoriasCurva(c.letra)} categorias)
								</StepButton>
							</Step>
						))}
					</Stepper>
					 : null}

					{filterValue ? tableFiltered() : renderTable()}

				</CardContent>
			</Card>

			{dialog}
		</Grid>
	);
}

const ViewGestaoCategoria = () => {
	const { uuid } = useParams();
	const isCadastro = !uuid;
	const navigate = useNavigate();
	const [unidades, setUnidades] = useState([]);
	const [departamentos, setDepartamentos] = useState([]);
	const [processo, setProcesso] = useState(null);
	const [errors, setErrors] = useState(null);
	const [loading, setLoading] = useState(false);
	const [dialog, setDialog] = useState(null);
	const [form, setForm] = useState({
		nome: '',
		tipo_ranking: GestaoCategoriaRankingCurva.UNSPECIFIED,
		unidades: [],
		departamentos: [],
		data_inicial: moment().add(-90, 'day').format('YYYY-MM-DD'),
		data_final: moment().format('YYYY-MM-DD'),
	});

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	useEffect(() => {
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
		DepartamentoAPI.search("", true)
			.then(rs => setDepartamentos(rs.departamentos || []))
			.catch(defaultProcessCatch());
	}, []);

	useEffect(() => {
		if (isCadastro || !uuid) return;

		GestaoCategoriaAPI.getGestaoCategoria(uuid)
			.then(rs => {
				setProcesso(rs);
				setForm({
					nome: rs.nome,
					tipo_ranking: rs.tipo_ranking,
					unidades: rs.unidades || [],
					departamentos: rs.departamentos || [],
					data_inicial: rs.periodo.inicio,
					data_final: rs.periodo.fim,
				});
			})
			.catch(defaultProcessCatch());
	}, [isCadastro, uuid]);

	const openCategoria = (categoria, unidades, semMovimentacao) => setDialog(
		<ViewCategoriaDialog
			processo={processo}
			categoria={categoria}
			unidades={unidades}
			semMovimentacao={semMovimentacao}
			onClose={() => setDialog(null)} />
	)

	const submit = () => {
		if (!isCadastro || loading) return;

		setLoading(true);
		showLoading(
			'Calculando curvas e gerando gestão de categoria...',
			GestaoCategoriaAPI.createGestaoCategoria(
				{
					nome: form.nome,
					tipo_ranking: form.tipo_ranking,
					todas_unidades: form.unidades.length === 0,
					todos_departamentos: form.departamentos.length === 0,
					periodo: {
						inicio: form.data_inicial,
						fim: form.data_final,
					},
					unidades: form.unidades.map(u => ({ uuid: u.uuid })),
					departamentos: form.departamentos.map(d => ({ uuid: d.uuid })),
				})
				.finally(() => setLoading(false))
				.then(rs => {
					alerts.snackbars.success('Gestão de Categoria cadastrado com sucesso');
					navigate(`../${rs.uuid}`);
				})
				.catch(defaultProcessCatch(errors => setErrors(errors))));
	}

	return (
		<Page title="Pricing / Gestão de Categorias / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Cadastro de processo de gestão de categorias" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											disabled={loading || !isCadastro}
											autoFocus
											label="Nome"
											value={form.nome}
											onChange={nome => changeField({ nome })}
											errorText={filterErrors(errors, 'nome')} />
									</Grid>
									<Grid item xs={6} md={3}>
										<TextField
											disabled={loading || !isCadastro}
											select
											label="Formato"
											value={form.tipo_ranking}
											onChange={tipo_ranking => changeField({ tipo_ranking })}
											errorText={filterErrors(errors, 'tipo_ranking')}>
											{[GestaoCategoriaRankingCurva.VENDA, GestaoCategoriaRankingCurva.LUCRO].map((r, k) => (
												<MenuItem key={k} value={r}>{gestaoCategoriaRankingCurvaFormatoText(r)}</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid item xs={6} md={3}>
										<DateRangePicker
											disabled={loading || !isCadastro}
											format="DD/MM/YYYY"
											label="Período"
											value={[form.data_inicial, form.data_final]}
											onChange={datas => changeField({
												data_inicial: datas[0],
												data_final: datas[1],
											})} />
									</Grid>
									<Grid item xs={12} md={6}>
										<Autocomplete
											disabled={loading || !isCadastro}
											multiple
											limitTags={4}
											value={form.unidades}
											options={unidades}
											onChange={(_, unidades) => changeField({ unidades })}
											getOptionLabel={option => option.codigo}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Unidades" />
											)}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<Autocomplete
											disabled={loading || !isCadastro}
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
								</Grid>
							</CardContent>
							<Divider />

							{isCadastro ? (
								<CardActions>
									<Button disabled={loading} variant="contained" color="primary" onClick={submit}>
										Gerar Cronograma
									</Button>
								</CardActions>
							) : null}
						</Card>
					</Grid>

					{!isCadastro && processo ? (
						<ListaCategorias
							processo={processo}
							onClickCategoria={openCategoria} />
					) : null}
				</Grid>
			</Container>

			{dialog}
		</Page>
	)
}

export default ViewGestaoCategoria;