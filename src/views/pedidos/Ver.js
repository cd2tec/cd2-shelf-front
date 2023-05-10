import React from 'react';
import Page from '../../components/Page';

import {
	makeStyles, Grid, Container, Card, CardHeader,
	Divider,
	CardContent,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		textAlign: 'right',
	},
	contentPedido: {
		'& strong': {
			display: 'block'
		},
		'& .MuiGrid-item': {
			lineHeight: 2
		}
	}
}));

const Ver = () => {
	const classes = useStyles();
	return (
		<Page title={`Visualizar Pedido #1`} className={classes.root} >
			<Container maxWidth={false} style={{ marginTop: 10 }} >
				<Card>
					<CardHeader title="Pedido" subheader="Informações completas sobre o pedido" />
					<Divider />
					<CardContent className={classes.contentPedido} >
						<Grid container spacing={2} >
							<Grid item xs={3} >
								<strong>Código:</strong> 1
									</Grid>
							<Grid item xs={3} >
								<strong>Data Emissão:</strong> 13/08/2020 20:48
									</Grid>
							<Grid item xs={3} >
								<strong>Data de Previsão de Entrega:</strong> 13/08/2020 20:48
									</Grid>
							<Grid item xs={3} >
								<strong>Situação:</strong> Entregue
									</Grid>
							<Grid item xs={4} >
								<strong>Fornecedor:</strong> TEMPO CERTO SOLUCOES EM SOFTWARE LTDA
									</Grid>
							<Grid item xs={4} >
								<strong>Emitente:</strong> TEMPO CERTO SOLUCOES EM SOFTWARE LTDA
									</Grid>
							<Grid item xs={4} >
								<strong>Destinatario:</strong> TEMPO CERTO SOLUCOES EM SOFTWARE LTDA
									</Grid>
						</Grid>
					</CardContent>
					<Divider />
					<CardHeader title="Itens do Pedido" />
					<Divider />
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>#</TableCell>
								<TableCell>Produto</TableCell>
								<TableCell>EAN</TableCell>
								<TableCell>Código</TableCell>
								<TableCell>Código Fornecedor</TableCell>
								<TableCell>Quantidade</TableCell>
								<TableCell>Volume</TableCell>
								<TableCell>Valor Unitário</TableCell>
								<TableCell>Valor Total</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell>1</TableCell>
								<TableCell>Produto X</TableCell>
								<TableCell>624981</TableCell>
								<TableCell>151233</TableCell>
								<TableCell>61522</TableCell>
								<TableCell>10</TableCell>
								<TableCell>4</TableCell>
								<TableCell>R$ 69,99</TableCell>
								<TableCell>R$ 279,96</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Card>
			</Container>
		</Page>
	)
}

export default Ver;