import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Container, Button, Grid, Divider,
	Card, CardHeader, CardContent, CardActions,
	IconButton, FormHelperText, MenuItem, Typography,
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';

import Page from '../../../components/Page';
import { TextField, CheckboxGroup } from '../../../components/material';
import { UnidadeAPI, defaultProcessCatch, ConcorrenteAPI, PesquisaAPI, filterErrors, TipoPesquisaAPI } from '../../../services/api';
import PesquisaProdutosDialog from '../../produtos/PesquisaDialog';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import { showLoading } from '../../../utils/loading';
import SelecionarPesquisaDialog from './SelecionarPesquisaExternaDialog';

function Cadastro() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		nome: '',
		tipo_pesquisa: '',
		unidades: [],
		concorrentes: [],
		produtos: [],
		data_pesquisa: '',
	});
	const [dialog, setDialog] = useState();
	const [errors, setErrors] = useState(null);
	const [unidades, setUnidades] = useState([]);
	const [concorrentes, setConcorrentes] = useState([]);
	const [tiposPesquisa, setTiposPesquisa] = useState([]);

	useEffect(() => {
		TipoPesquisaAPI.list()
			.then(rs => setTiposPesquisa(rs.tipos || []))
			.catch(defaultProcessCatch());

		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());

		ConcorrenteAPI.list(1, 100)
			.then(rs => setConcorrentes(rs.concorrentes || []))
			.catch(defaultProcessCatch());
	}, []);

	const selecionarPesquisaRealizada = () => setDialog(
		<SelecionarPesquisaDialog
			onClose={() => setDialog()}
			onSelect={pesquisa => {
				setDialog();
				PesquisaAPI.getPesquisaExterna(pesquisa.data)
					.then(rs => {
						const pesquisa = rs.pesquisa || {};
						const concorrentes = pesquisa.concorrentes || [];
						const unidades = pesquisa.unidades || [];
						const produtos = pesquisa.produtos || [];

						setForm({
							...form,
							data_pesquisa: pesquisa.data,
							produtos: produtos,
							unidades: unidades.map(u => u.uuid),
							concorrentes: concorrentes.map(c => c.uuid),
						});
					})
					.catch(defaultProcessCatch());
			}} />
	)

	const carregarSugestaoProdutos = () => {
		if (!form.tipo_pesquisa) return;
		showLoading(
			'Buscando sugestão de produtos',
			TipoPesquisaAPI.getSugestaoProdutos(form.tipo_pesquisa)
				.then(rs => changeField({ produtos: rs.produtos || [] }))
				.catch(defaultProcessCatch()));
	}

	const openSelecaoProduto = () => setDialog(
		<PesquisaProdutosDialog
			selecionados={form.produtos}
			onChange={produtos => changeField({ produtos })}
			onClose={() => setDialog()} />
	)

	const submit = () => {
		setErrors(null);
		PesquisaAPI.create(
			{
				descricao: form.nome,
				unidades: form.unidades,
				concorrentes: form.concorrentes,
				produtos: form.produtos.map(p => p.uuid),
				data_pesquisa: form.data_pesquisa,
			})
			.then(rs => navigate(`../${rs.uuid}`))
			.catch(defaultProcessCatch(errors => setErrors(errors)));
	}

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	const removerProduto = produto =>
		changeField({ produtos: form.produtos.filter(p => p.uuid !== produto.uuid) });

	return (
		<Page title="Pricing / Competitividade / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={7}>
						<Card>
							<CardHeader title="Cadastro de Pesquisa" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											autoFocus
											label="Nome"
											value={form.nome}
											onChange={nome => changeField({ nome })}
											errorText={filterErrors(errors, 'descricao')} />
									</Grid>

									<Grid item xs={12}>
										<TextField
											select
											label="Tipo de Pesquisa"
											value={form.tipo_pesquisa || ''}
											onChange={tipo_pesquisa => changeField({ tipo_pesquisa })}
											errorText={filterErrors(errors, 'tipo_pesquisa')}>
											{tiposPesquisa.map((tp, index) => (
												<MenuItem key={index} value={tp.uuid}>{tp.nome}</MenuItem>
											))}
										</TextField>
									</Grid>

									<Grid item xs={6}>
										<CheckboxGroup
											required
											label="Unidades"
											options={unidades.map(u => ({ label: `${u.codigo} - ${u.codigo}`, value: u.uuid }))}
											value={form.unidades}
											onChange={uuids => {
												const codigos = unidades.filter(u => uuids.indexOf(u.uuid) > -1).map(u => u.codigo);
												changeField({
													unidades: uuids,
													concorrentes: concorrentes.filter(c => (c.unidades || []).some(u => codigos.indexOf(u.codigo) >= 0)).map(c => c.uuid),
												});
											}}
											errorText={filterErrors(errors, 'unidades')} />
									</Grid>

									<Grid item xs={6}>
										<CheckboxGroup
											required
											label="Concorrentes"
											options={concorrentes.map(u => ({ label: u.nome, value: u.uuid }))}
											value={form.concorrentes}
											onChange={concorrentes => changeField({ concorrentes })}
											errorText={filterErrors(errors, 'concorrentes')} />
									</Grid>

									<Grid item xs={12} >
										<Grid container>
											<Grid item xs={12} >
												<Typography variant="subtitle2" style={{ textAlign: 'right', marginBottom: 18, marginRight: 15, }} >
													Produtos selecionados: {form.produtos.length}
												</Typography>
												<Divider />
											</Grid>
											<Grid item xs={12} >
												<TableSort rows={form.produtos} >
													<TableSortColumn field="codigo" title="Código" width={150} />
													<TableSortColumn field="codigo_barra" title="EAN" width={150} />
													<TableSortColumn field="descricao" title="Descrição" />
													<TableSortColumn width={50} padding="none" disabled={true}
														formatter={(_, p) => (
															<IconButton color="secondary" onClick={() => removerProduto(p)}>
																<DeleteIcon />
															</IconButton>
														)}
													/>
												</TableSort>
											</Grid>
											<Grid item xs={12} >
												{filterErrors(errors, 'produtos') ? (
													<FormHelperText error={true}>
														{filterErrors(errors, 'produtos')}
													</FormHelperText>
												) : null}

												<div style={{ textAlign: 'right', marginTop: 16 }}>
													<Button color="primary" variant="outlined"
														onClick={selecionarPesquisaRealizada}
														style={{ marginRight: 8 }}>
														Selecionar pesquisa realizada
													</Button>

													<Button color="primary" variant="outlined"
														onClick={carregarSugestaoProdutos}
														style={{ marginRight: 8 }}>
														Inicilizar Sugestão de Produtos
													</Button>

													<Button color="secondary" variant="outlined"
														onClick={() => openSelecaoProduto()}>
														Pesquisar Produtos
													</Button>
												</div>
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions>
								<Button variant="contained" color="primary" onClick={submit}>
									Cadastrar
								</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>

			{dialog}
		</Page>
	);
}

export default Cadastro;