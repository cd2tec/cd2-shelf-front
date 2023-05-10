import React, { useState } from 'react';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import { TextField } from '../../components/material'

import Page from '../../components/Page';
import { PermissaoAPI, filterErrors, defaultProcessCatch } from '../../services/api';
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
  const [permissao, setPermissao] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();

  const submit = () => {
    if (loading) return

    setLoading(true);
    PermissaoAPI.create({permissao})
      .then(_ => {
        navigate('/admin/permissoes');
        alerts.snackbars.success('Permissão criada com sucesso');
      })
      .finally(() => setLoading(false))
      .catch(defaultProcessCatch(setErrors));
  }

	return (
		<Page title="Permissões / Criar" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Criar uma nova permissão" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="permissao"
                      label="Permissão"
                      value={permissao}
                      onChange={setPermissao}
                      errorText={filterErrors(errors, 'permissao')} />
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
