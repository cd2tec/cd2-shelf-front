import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, TextField, CardActions, Button,
} from '@material-ui/core';

import Page from '../../components/Page';
import { ProdutoAPI, defaultProcessCatch } from '../../services/api';

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
	const { uuid } = useParams();
	const classes = useStyles();
	const [produto, setProduto] = useState(null);

	useEffect(() => {
		ProdutoAPI.get(uuid)
			.then(rs => setProduto(rs))
			.catch(defaultProcessCatch());
	}, [uuid]);

	if (!produto) return null;

	return (
		<Page title="Cadastro" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={7}>
						<Card>
							<CardHeader title="Cadastro de produto" subheader="Digite abaixo as informações do produto" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={5}>
										<TextField
											name="codigo"
											label="Código"
											value={produto.codigo}
											readOnly />
									</Grid>
									<Grid item xs={10}>
										<TextField
											name="descricao"
											label="Descrição"
											value={produto.descricao}
											readOnly />
									</Grid>
									<Grid item xs={10}>
										<TextField
											name="descricao_pdv"
											label="Descrição PDV"
											value={produto.descricao_pdv}
											readOnly />
									</Grid>
									<Grid item xs={3}>
										<TextField
											name="valor"
											label="Valor"
											readOnly />
									</Grid>
								</Grid>
							</CardContent>
							<Divider />
							<CardActions className={classes.actions}>
								<Button variant="contained" color="primary">Cadastrar</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
};

export default Cadastro;