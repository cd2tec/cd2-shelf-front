import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button
} from '@material-ui/core';

import { TextField } from '../../../../components/material'

import Page from '../../../../components/Page';
import { CurvaAPI, filterErrors, defaultProcessCatch } from '../../../../services/api';
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
  const navigate = useNavigate();
  const [letra, setLetra] = useState('');
  const [porcentagem, setPorcentagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();
  const uuid = useParams().uuid;

  const submit = () => {
    if (loading) return

    setLoading(true);
    CurvaAPI.createAdmin({entidade_uuid: uuid, curva: {letra, porcentagem}})
      .then(_ => {
        alerts.snackbars.success('Curva criada com sucesso');
        navigate('/admin/empresas/' + uuid + '/curvas');
      })
      .finally(() => setLoading(false))
      .catch(defaultProcessCatch(setErrors));
  }

	return (
		<Page title="Empresas / Curvas / Criar" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Criar nova curva" />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											name="letra"
											label="Letra"
											value={letra}
                      onChange={setLetra}
									    errorText={filterErrors(errors, 'letra')} />
									</Grid>
                  <Grid item xs={12} md={6}>
										<TextField
											name="porcentagem"
											label="Porcentagem"
											value={porcentagem}
                      onChange={setPorcentagem}
									    errorText={filterErrors(errors, 'porcentagem')} />
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
