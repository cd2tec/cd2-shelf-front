import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Container, Button, Grid, Divider,
	Card, CardHeader, CardContent, CardActions,
	MenuItem
} from '@material-ui/core';

import Page from '../../components/Page';
import { TextField } from '../../components/material';
import {
	ModeloPrecificacaoAPI, TipoPesquisaAPI, TipoPrecificacao,
	tipoPrecificacaoText, defaultProcessCatch, filterErrors, CategoriaAPI, DepartamentoAPI,
} from '../../services/api';
import { Autocomplete } from '@material-ui/lab';

const Cadastro = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		departamento: "",
		grupo: "",
		tipo_pesquisa: "",
		tipo_precificacao: "",
	});
	const [tiposPesquisa, setTiposPesquisa] = useState([]);
	const [errors, setErrors] = useState(null);
	const [categorias, setCategorias] = useState([]);
	const [departamentos, setDepartamentos] = useState([]);

	const precificacoes = [TipoPrecificacao.MAIORPRECO, TipoPrecificacao.MAIORPRECO,
	TipoPrecificacao.MARGEMCADASTRADA, TipoPrecificacao.MARGEMMINIMA];

	const loadTipoPesquisa = () => {
		TipoPesquisaAPI.list()
			.then(rs => setTiposPesquisa(rs.tipos || []))
			.catch(defaultProcessCatch())
	}

	useEffect(() => {
		loadTipoPesquisa();
		CategoriaAPI.search({})
			.then(rs => setCategorias(rs.categorias || []))
			.catch(defaultProcessCatch)
		
		DepartamentoAPI.search("", true)
			.then(rs => setDepartamentos(rs.departamentos || []))
			.catch(defaultProcessCatch)
	}, [])

	useEffect(() => {
		const filtros = {}
		if (form.departamento) {
			filtros.departamentos_uuid = [form.departamento.uuid]
		}
			CategoriaAPI.search({ filtros })
			.then(rs => setCategorias(rs.categorias || []))
			.catch(defaultProcessCatch)
	}, [form.departamento])

	const submit = () => {
		setErrors(null);
		ModeloPrecificacaoAPI.create({
			departamento: form.departamento,
			grupo: form.grupo,
			tipo_pesquisa: {
				uuid: form.tipo_pesquisa
			},
			tipo_precificacao: form.tipo_precificacao,
		})
			.then(() => navigate('../'))
			.catch(defaultProcessCatch(errors => setErrors(errors)));
	}

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	return (
		<Page title="Modelo Precificação / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={7}>
						<Card>
							<CardHeader title="Cadastro de Modelo de Precificação" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Autocomplete
											value={form.departamento}
											options={departamentos}
											onChange={(_, departamento) => changeField({ departamento })}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Departamento" />
											)}
										/>
									</Grid>
								</Grid>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Autocomplete
											value={form.grupo}
											options={categorias}
											onChange={(_, grupo) => changeField({ grupo })}
											getOptionLabel={option => option.nome}
											getOptionSelected={(opt, value) => opt.uuid === value.uuid}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" label="Grupo" />
											)}
										/>
									</Grid>
								</Grid>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											select
											label="Tipo de Pesquisa"
											value={form.tipo_pesquisa}
											onChange={tipo_pesquisa => changeField({ tipo_pesquisa })}
											errorText={filterErrors(errors, 'tipo_pesquisa')}>
											{tiposPesquisa.map((t, k) => {
												return (
													<MenuItem key={k} value={t.uuid} >{t.nome}</MenuItem>
												);
											})}
										</TextField>
									</Grid>
								</Grid>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											select
											label="Tipo Precificação"
											value={form.tipo_precificacao}
											onChange={tipo_precificacao => changeField({ tipo_precificacao })}
											errorText={filterErrors(errors, 'tipo_precificacao')}>
											{precificacoes.map((p, k) => {
												return (
													<MenuItem key={k} value={p} >{tipoPrecificacaoText(p)}</MenuItem>
												)
											})}
										</TextField>
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
		</Page>
	);
}

export default Cadastro;