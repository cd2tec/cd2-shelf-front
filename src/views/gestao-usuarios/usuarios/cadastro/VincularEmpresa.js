import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button
} from '@material-ui/core';

import { TextField } from '../../../../components/material'

import Page from '../../../../components/Page';
import { UsuarioAPI, filterErrors, defaultProcessCatch } from '../../../../services/api';
import alerts from '../../../../utils/alerts';

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

const VincularEmpresa = () => {
	const classes = useStyles();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();
  const navigate = useNavigate();

  const submit = () => {
    if (loading) return

    setLoading(true);
    UsuarioAPI.vincularEntidade({email, senha})
      .then(_ => {
        alerts.snackbars.success('Usuário vinculado com sucesso');
        navigate('/app/gestao-usuarios');
      })
      .finally(() => setLoading(false))
      .catch(defaultProcessCatch(setErrors));
  }

	return (
		<Page title="Gestão de Usuários / Usuários / Vincular Empresa" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Vincular usuário a empresa" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      errorText={filterErrors(errors, 'email')} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="password"
                      name="senha"
                      label="Senha"
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

export default VincularEmpresa;
