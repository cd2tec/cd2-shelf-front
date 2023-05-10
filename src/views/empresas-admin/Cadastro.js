import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button
} from '@material-ui/core';

import { TextField } from '../../components/material'

import Page from '../../components/Page';
import { EntidadeAPI, filterErrors, defaultProcessCatch } from '../../services/api';
import alerts from '../../utils/alerts';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		padding: 15,
	}
}));

const Cadastro = () => {
	const classes = useStyles();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();

  const submit = () => {
    if (loading) return

    setLoading(true);
    EntidadeAPI.create({nome, apelido, senha})
      .then(_ => {
        navigate('/admin/empresas');
        alerts.snackbars.success('Empresa criada com sucesso');
      })
      .finally(() => setLoading(false))
      .catch(defaultProcessCatch(setErrors));
  }

	return (
		<Page title="Empresas / Criar" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Criar nova empresa" />
              <p style={{marginLeft: 20, marginBottom: 20, fontWeight: 700, fontSize: 15}}>* Observação: O usuário master será criado com o email master@[apelidoDaEmpresa].com e o usuário de integração será criado com o email integracao@[apelidoDaEmpresa].com, ambos com a mesma senha master.</p>
							<Divider /> 
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											name="nome"
											label="Nome da Empresa"
											value={nome}
                      onChange={setNome}
									    errorText={filterErrors(errors, 'nome')} />
									</Grid>
                  <Grid item xs={12} md={6}>
										<TextField
											name="apelido"
											label="Apelido da Empresa"
											value={apelido}
                      onChange={setApelido}
									    errorText={filterErrors(errors, 'apelido')} />
									</Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="password"
                      name="senha"
                      label="Senha Master dos Usuários"
                      value={senha}
                      onChange={setSenha}
                      errorText={filterErrors(errors, 'senha')}/>
                  </Grid>
                </Grid>
							</CardContent>
							<Divider />
							<CardActions className={classes.actions}>
								<Button disabled={loading} variant="contained" color="primary" onClick={submit}>Cadastrar</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
};

export default Cadastro;
