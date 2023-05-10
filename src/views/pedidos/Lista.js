import React from 'react';

import {
	Table, TableHead, TableRow,
	TableCell, Paper, makeStyles,
	Grid, Container, TableBody, IconButton, Tooltip,
} from '@material-ui/core';

import { Visibility as ViewIcon } from '@material-ui/icons';

import { Link } from 'react-router-dom';

import Page from '../../components/Page';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		textAlign: 'right',
	}
}));

const pedidos = [
	{
		codigo: 1,
		fornecedor: 'TEMPO CERTO SOLUCOES EM SOFTWARE LTDA',
		destinatario: 'TEMPO CERTO SOLUCOES EM SOFTWARE LTDA',
	},
]

const Pedidos = () => {
	const classes = useStyles();
	return (
		<Page title="Pedidos"
			className={classes.root} >
			<Container maxWidth={false} style={{ marginTop: 10 }} >
				<Grid container spacing={2} >
					<Grid item xs={12}>
						<Paper>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Código</TableCell>
										<TableCell>Fornecedor</TableCell>
										<TableCell>Destinatario</TableCell>
										<TableCell>Data Emissão</TableCell>
										<TableCell></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{pedidos.map((p, k) => <TableRow key={k} >
										<TableCell>{p.codigo}</TableCell>
										<TableCell>{p.fornecedor}</TableCell>
										<TableCell>{p.destinatario}</TableCell>
										<TableCell>13/08/2020 20:48</TableCell>
										<TableCell padding="none">
											<Tooltip title="Visualizar Pedido" >
												<IconButton component={Link} to={`${p.codigo}`} >
													<ViewIcon />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>)}
								</TableBody>
							</Table>
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
}

export default Pedidos;