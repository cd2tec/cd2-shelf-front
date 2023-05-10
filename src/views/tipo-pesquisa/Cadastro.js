import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container, Button, Grid, Divider, InputLabel,
	Card, CardHeader, CardContent, CardActions,
} from '@material-ui/core';

import Page from '../../components/Page';
import { TextField, NumberField, TableSort, TableSortColumn } from '../../components/material';
import { TipoPesquisaAPI, defaultProcessCatch, filterErrors, CurvaAPI } from '../../services/api';
import alerts from '../../utils/alerts';

const Cadastro = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const isAlteracao = !!uuid;

	const [form, setForm] = useState({
		nome: '',
		curvas_produtos: {},
	});
	const [errors, setErrors] = useState(null);
	const [curvas, setCurvas] = useState([]);

	useEffect(() => {
		CurvaAPI.list()
			.then(rs => setCurvas(rs.curvas || []))
			.catch(defaultProcessCatch());
	}, []);

	useEffect(() => {
		if (!isAlteracao) return;
		TipoPesquisaAPI.get(uuid)
			.then(rs => setForm({
				nome: rs.nome,
				curvas_produtos: rs.curvas_produtos || {},
			}))
			.catch(defaultProcessCatch());
	}, [isAlteracao, uuid]);


	const submit = () => {
		setErrors(null);

		if (isAlteracao) {
			alerts.confirmYesNo('Alteração de tipo de pesquisa', 'Confirmar alteração do tipo de pesquisa?', {
				onYes: () => {
					TipoPesquisaAPI.update(uuid, form)
						.then(() => {
							alerts.snackbars.success('Tipo de pesquisa alterado com sucesso');
						})
						.catch(defaultProcessCatch(errors => setErrors(errors)));
				},
			})
			return;
		}

		alerts.confirmYesNo('Cadastro de tipo de pesquisa', 'Confirmar cadastro do tipo de pesquisa?', {
			onYes: () => {
				TipoPesquisaAPI.create(form)
					.then(() => {
						navigate('../');
						alerts.snackbars.success('Tipo de pesquisa registrado com sucesso');
					})
					.catch(defaultProcessCatch(errors => setErrors(errors)));
			}
		});
	}

	const changeField = values =>
		setForm(v => ({ ...v, ...values }));

	return (
		<Page title="Tipo de Pesquisa / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={7}>
						<Card>
							<CardHeader title="Cadastro de Tipo de Pesquisa" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											autoFocus
											label="Nome"
											value={form.nome}
											onChange={nome => changeField({ nome })}
											errorText={filterErrors(errors, 'nome')} />
									</Grid>

									<Grid item xs={12}>
										<InputLabel focused={true}>Produtos por Curva (opcional)</InputLabel>
										<TableSort rows={curvas} size="small" style={{ maxWidth: 200 }} >
											<TableSortColumn field="letra" title="Curva" />
											<TableSortColumn title="Quantidade"
												formatter={(_, c) => <NumberField
													variant="standard"
													margin="none"
													value={form.curvas_produtos[c.letra]}
													onChange={v => changeField({
														curvas_produtos: {
															...form.curvas_produtos,
															[c.letra]: v,
														},
													})}
													decimals={0} />}
											/>
										</TableSort>
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions>
								<Button variant="contained" color="primary" onClick={submit}>
									{isAlteracao ? 'Salvar' : 'Cadastrar'}
								</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container >
		</Page >
	);
}

export default Cadastro;