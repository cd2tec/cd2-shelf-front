import React, { useState } from 'react';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button
} from '@material-ui/core';

import { TextField } from '../../../../components/material'

import Page from '../../../../components/Page';
import {defaultProcessCatch, UsuarioAPI} from '../../../../services/api';
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

const Cadastro = () => {
	const classes = useStyles();
  const [email, setEmail] = useState('');
  const [key, setKey] = useState({
		access_key: '',
		secret_key: ''
	});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (loading) return

		setLoading(true);
		UsuarioAPI.generateAPIKey({
			email: email
		})
			.finally(() => (setLoading(false)))
			.then(rs => {
				setKey({
					access_key: rs.access_key,
					secret_key: rs.secret_key
				})
				alerts.snackbars.success('API KEY criada com sucesso');
			})
			.catch(defaultProcessCatch)
  }

	return (
		<Page title="Empresas / API KEY / Criar" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Criar nova API KEY" />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											name="Email"
											label="Email"
											value={email}
                      onChange={setEmail} />
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions className={classes.actions}>
								<Button disabled={loading} variant="contained" color="primary" onClick={submit}>Gerar API KEY</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
				{key.access_key && key.secret_key ?
					<Grid container spacing={2}>
						<Card elevation={0} style={{margin: '10px', width: '100%'}}>
							<CardHeader title="API KEY gerada" />
							<CardContent>
								<p style={{color: 'red'}}>Nota: anote os dados a seguir, após sair dessa tela não será mais possível recuperar a SECRET KEY</p>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											disabled
											name="ACCESS KEY"
											label="ACCESS KEY"
											value={key.access_key}/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											disabled
											name="SECRET KEY"
											label="SECRET KEY"
											value={key.secret_key}/>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid> : null }
			</Container>
		</Page>
	)
};

export default Cadastro;
