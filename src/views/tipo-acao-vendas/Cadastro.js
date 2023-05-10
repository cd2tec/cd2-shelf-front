import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container, Button, Grid, Divider,
	Card, CardHeader, CardContent, CardActions,
	Typography, Table, TableHead, TableRow, TableCell,
	TableBody, makeStyles, colors, InputAdornment,
} from '@material-ui/core';

import { Autocomplete } from '@material-ui/lab';

import Page from '../../components/Page';
import { TextField, NumberField } from '../../components/material';

import { UnidadeAPI, DepartamentoAPI, CategoriaAPI, CurvaAPI, AcaoVendaAPI } from '../../services/api';
import { filterErrors, defaultProcessCatch } from '../../services/api';

import alerts from '../../utils/alerts';
import { numberFormat, DECIMAIS } from '../../utils/formats';

let handleTimeout;

const useStyles = makeStyles(() => ({
	columnHeaderQtdItensCurva: {
		backgroundColor: colors.blue[300],
		border: `1px solid ${colors.blue[300]}`,
		borderBottom: 'none',
		width: 150,
	},
	columnPercentCurva: {
		border: `1px solid ${colors.blue[300]}`,
		width: 100,
	},
	columnHeaderPercentMargem: {
		backgroundColor: colors.grey[300],
		border: `1px solid ${colors.grey[300]}`,
		borderBottom: 'none',
	},
	columnPercentMargem: {
		border: `1px solid ${colors.grey[300]}`,
		width: 140,
	},
	columnFooterPercentMargem: {
		border: `1px solid ${colors.grey[300]}`,
		fontWeight: 600,
	},
	rowProjecaoLucro: {
		'& > td': {
			fontWeight: 600,
		},
		backgroundColor: colors.green[100],
	},
	mgCurvaTotal: {
		fontWeight: 600,
	},
}));

const ListCurvas = ({
	quantidadeItens = 0,
	projecao = {},
	curvas,
	value = {},
	onChange,
	valorSimulacao,
	onChangeValorSimulacao,
	tabIndex = 1,
}) => {
	const classes = useStyles();

	const handleChange = (letra, campo) => vv => {
		let v = value[letra] || {};
		onChange({ ...value, [letra]: { ...v, [campo]: vv } })
	}

	const countCurvas = curvas.length;

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell colSpan={8}>
						<Typography variant="h6">Total de Itens</Typography>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Curvas</TableCell>
					<TableCell colSpan={2} align="center" className={classes.columnHeaderQtdItensCurva}>
						Qtd. Itens: {quantidadeItens}
					</TableCell>
					<TableCell colSpan={3} align="center" className={classes.columnHeaderPercentMargem}>Parâmetros de Margem</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{curvas.map((c, index) => {
					const refTabIndex = index + tabIndex;
					return (
						<TableRow key={index}>
							<TableCell>Curva {c.letra}</TableCell>
							<TableCell align="center" className={classes.columnPercentCurva}>
								<NumberField
									variant="standard"
									margin="none"
									decimals={0}
									value={value[c.letra] ? value[c.letra].percentual : undefined}
									onChange={handleChange(c.letra, 'percentual')}
									InputProps={{
										startAdornment: <InputAdornment position="start">%</InputAdornment>
									}}
									inputProps={{ tabIndex: refTabIndex }} />
							</TableCell>
							<TableCell align="center" className={classes.columnPercentCurva}>
								{value[c.letra]
									? Math.round(((value[c.letra].percentual || 0) * quantidadeItens) / 100)
									: 0}
							</TableCell>
							<TableCell align="center" className={classes.columnPercentMargem}>
								<NumberField
									variant="standard"
									margin="none"
									value={value[c.letra] ? value[c.letra].minima : undefined}
									onChange={handleChange(c.letra, 'minima')}
									inputProps={{ tabIndex: refTabIndex + countCurvas }} />
							</TableCell>
							<TableCell align="center" className={classes.columnPercentMargem}>
								<NumberField
									variant="standard"
									margin="none"
									value={value[c.letra] ? value[c.letra].media : undefined}
									onChange={handleChange(c.letra, 'media')}
									inputProps={{ tabIndex: refTabIndex + (countCurvas * 2) }} />
							</TableCell>
							<TableCell align="center" className={classes.columnPercentMargem}>
								<NumberField
									variant="standard"
									margin="none"
									value={value[c.letra] ? value[c.letra].maxima : undefined}
									onChange={handleChange(c.letra, 'maxima')}
									inputProps={{ tabIndex: refTabIndex + (countCurvas * 3) }} />
							</TableCell>
						</TableRow>
					)
				})}

				<TableRow>
					<TableCell colSpan={3}></TableCell>

					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						{numberFormat(projecao.margem.minima, DECIMAIS.PERCENTUAL)}%
					</TableCell>
					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						{numberFormat(projecao.margem.media, DECIMAIS.PERCENTUAL)}%
					</TableCell>
					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						{numberFormat(projecao.margem.maxima, DECIMAIS.PERCENTUAL)}%
					</TableCell>
				</TableRow>

				<TableRow className={classes.rowProjecaoLucro}>
					<TableCell align="right">
						Digite a projeção de receita de vendas para simulação da ação:
					</TableCell>
					<TableCell colSpan={2} className={classes.columnFooterPercentMargem}>
						<NumberField
							variant="standard"
							margin="none"
							value={valorSimulacao}
							onChange={v => onChangeValorSimulacao(v)}
							inputProps={{ tabIndex: (countCurvas * 4) + tabIndex }} />
					</TableCell>
					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						R$ {numberFormat(projecao.projecao.minima, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						R$ {numberFormat(projecao.projecao.media, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="center" className={classes.columnFooterPercentMargem}>
						R$ {numberFormat(projecao.projecao.maxima, DECIMAIS.VALOR)}
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

const Cadastro = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const isAlteracao = !!uuid;

	const [unidades, setUnidades] = useState([]);
	const [curvas, setCurvas] = useState([]);
	const [departamentos, setDepartamentos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [errors, setErrors] = useState(null);
	const [form, setForm] = useState({
		nome: '',
		unidades: [],
		departamentos: [],
		categorias: [],
		quantidade_itens: 0,
		quantidade_dias: 0,
		margens_curvas: {},
		valor_simulacao: 100,
	});
	const [projecao, setProjecao] = useState({
		margem: {},
		projecao: {},
	});

	useEffect(() => {
		if (!isAlteracao) return;
		AcaoVendaAPI.getTipoAcaoVenda(uuid)
			.then(rs => setForm({
				nome: rs.nome,
				unidades: (rs.unidades || []),
				departamentos: (rs.departamentos || []),
				categorias: (rs.categorias || []),
				quantidade_dias: rs.quantidade_dias || 0,
				quantidade_itens: rs.quantidade_itens || 0,
				margens_curvas: rs.margens_curvas || {},
				valor_simulacao: rs.valor_simulacao || 0,
			}))
			.catch(defaultProcessCatch());
	}, [isAlteracao, uuid]);

	useEffect(() => {
		CurvaAPI.list()
			.then(rs => setCurvas(rs.curvas || []))
			.catch(defaultProcessCatch());
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
		DepartamentoAPI.search("",true)
			.then(rs => setDepartamentos(rs.departamentos || []))
			.catch(defaultProcessCatch());
	}, []);

	useEffect(() => {
		CategoriaAPI.search(
			{
				filtros: {
					departamentos_uuid: form.departamentos.map(d => d.uuid),
				}
			})
			.then(rs => setCategorias(rs.categorias || []))
			.catch(defaultProcessCatch());
	}, [form.departamentos])

	useEffect(() => {
		clearTimeout(handleTimeout);
		handleTimeout = setTimeout(() => {
			let valoresCalculo = {
				valor: form.valor_simulacao,
				margens: { curvas: {} },
			};
			for (const curva in form.margens_curvas) {
				const margensCurva = form.margens_curvas[curva];
				valoresCalculo.margens.curvas[curva] = {
					porcentagem_produtos: margensCurva.percentual,
					minima: margensCurva.minima,
					media: margensCurva.media,
					maxima: margensCurva.maxima,
				};
			}

			AcaoVendaAPI.projecaoLucroAcao(valoresCalculo)
				.then(rs => setProjecao(rs))
				.catch(defaultProcessCatch());
		}, 600);
	}, [form.valor_simulacao, form.margens_curvas]);

	const submit = () => {
		const tipo = {
			nome: form.nome,
			unidades: (form.unidades || []).map(u => ({ uuid: u.uuid })),
			categorias: (form.categorias || []).map(c => ({ uuid: c.uuid })),
			departamentos: (form.departamentos || []).map(d => ({ uuid: d.uuid })),
			quantidade_dias: Number(form.quantidade_dias),
			quantidade_itens: Number(form.quantidade_itens),
			margens_curvas: form.margens_curvas || {},
			valor_simulacao: form.valor_simulacao,
		};

		if (isAlteracao) {
			alerts.confirmYesNo('Alteração de tipo de ação', 'Confirmar alteração do tipo de ação?', {
				onYes: () => {
					AcaoVendaAPI.updateTipoAcaoVenda(uuid, tipo)
						.then(() => {
							alerts.snackbars.success('Tipo de ação alterado com sucesso');
						})
						.catch(defaultProcessCatch(errors => setErrors(errors)));
				},
			})
			return;
		}

		alerts.confirmYesNo('Cadastro de tipo de ação', 'Confirmar cadastro do tipo de ação?', {
			onYes: () => {
				AcaoVendaAPI.createTipoAcaoVenda({ tipo })
					.then(() => {
						navigate('../');
						alerts.snackbars.success('Tipo de ação registrado com sucesso');
					})
					.catch(defaultProcessCatch(errors => setErrors(errors)));
			}
		});
	}

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	return (
		<Page title="Tipo de Ação de Vendas / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={12}>
						<Card>
							<CardHeader title="Cadastro de Tipo de Ação de Vendas" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<TextField
											autoFocus
											label="Nome"
											value={form.nome}
											onChange={nome => changeField({ nome })}
											errorText={filterErrors(errors, 'nome')}
											inputProps={{ tabIndex: 1 }} />
									</Grid>
									<Grid item xs={3}>
										<TextField
											label="Qtd. Dias"
											value={form.quantidade_dias}
											onChange={quantidade_dias => changeField({ quantidade_dias })}
											errorText={filterErrors(errors, 'quantidade_dias')}
											inputProps={{ tabIndex: 2 }} />
									</Grid>
									<Grid item xs={3}>
										<TextField
											label="Qtd. Itens"
											value={form.quantidade_itens}
											onChange={quantidade_itens => changeField({ quantidade_itens })}
											errorText={filterErrors(errors, 'quantidade_itens')}
											inputProps={{ tabIndex: 3 }} />
									</Grid>
									<Grid item xs={12}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.unidades}
											options={unidades}
											onChange={(_, unidades) => changeField({ unidades })}
											getOptionLabel={option => `${option.codigo} - ${option.codigo}`}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField
													{...params}
													variant="outlined"
													label="Unidades"
													inputProps={{ ...params.inputProps, tabIndex: 4 }} />
											)}
										/>
									</Grid>
									<Grid item xs={6}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.departamentos}
											options={departamentos}
											onChange={(_, departamentos) => changeField({ departamentos })}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField
													{...params}
													variant="outlined"
													label="Departamentos"
													inputProps={{ ...params.inputProps, tabIndex: 5 }} />
											)}
										/>
									</Grid>
									<Grid item xs={6}>
										<Autocomplete
											multiple
											limitTags={4}
											value={form.categorias}
											options={categorias}
											onChange={(_, categorias) => changeField({ categorias })}
											getOptionLabel={option => `${option.nome} (${option.classificacao})`}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField
													{...params}
													variant="outlined"
													label="Categorias"
													inputProps={{ ...params.inputProps, tabIndex: 6 }} />
											)}
										/>
									</Grid>
								</Grid>
							</CardContent>
							<Divider />

							<ListCurvas
								quantidadeItens={form.quantidade_itens}
								curvas={curvas}
								value={form.margens_curvas}
								onChange={margens_curvas => changeField({ margens_curvas })}
								projecao={projecao}
								valorSimulacao={form.valor_simulacao}
								onChangeValorSimulacao={valor_simulacao => changeField({ valor_simulacao })}
								tabIndex={20} />

							<CardActions>
								<Button variant="contained" color="primary" onClick={submit} tabIndex="50">
									{isAlteracao ? 'Salvar' : 'Cadastrar'}
								</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	);
}

export default Cadastro;