import React, { useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';

import {
	makeStyles, Container, TableContainer, Grid,
	Paper,
	colors, Button,
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { PesquisaAPI, defaultProcessCatch, filterErrors } from '../../../../services/api';

import CustomTextField from './CustomTextField';
import alerts from '../../../../utils/alerts';

import { TableSort, TableSortColumn } from '../../../../components/material';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		height: '100%',
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(11),
	},
	tableResponsive: {
		overflowX: 'auto',
		'& table > thead > tr > th': {
			textTransform: 'uppercase',
		},
		'& table > thead > tr > th, & > table > thead > tr > td': {
			paddingRight: 0,
		}
	},
	columnConcorrente: {
		backgroundColor: colors.grey[200],
		width: 200,
	},
}));

const PesquisaPrecosConcorrentes = ({ pesquisa, onIniciado }) => {
	const classes = useStyles();
	const [valoresConcorrentes, setValoresConcorrentes] = useState({});
	const [errors, setErrors] = useState(null);

	const reloadPrecos = useCallback(() => {
		PesquisaAPI.getValoresProdutos(pesquisa.uuid)
			.then(rs => {
				let valores = {};
				for (const v of rs.concorrentes || []) {
					valores[`${v.concorrente_uuid}_${v.produto_uuid}`] = v.preco_venda;
				}
				setValoresConcorrentes(valores);
			})
			.catch(defaultProcessCatch());
	}, [pesquisa]);

	useEffect(() => {
		if (!pesquisa) return;
		reloadPrecos();
	}, [pesquisa, reloadPrecos]);

	if (!pesquisa) return null;
	const { produtos = [], concorrentes = [] } = pesquisa || {};

	const handleChangePrecoVenda = (produto, concorrente, precoVenda) => {
		PesquisaAPI.updatePrecoVendaConcorrente(
			pesquisa.uuid,
			{
				concorrente_uuid: concorrente.uuid,
				produto_uuid: produto.uuid,
				preco_venda: precoVenda,
			})
			.then(() => {
				alerts.snackbars.success('Preço atualizado com sucesso')
				reloadPrecos();
			})
			.catch(err => {
				alerts.snackbars.error('Erro ao atualizar preço');
				defaultProcessCatch()(err);
			});
	}

	const iniciarAnalise = () => {
		alerts.confirmYesNo(
			'Iniciar análise',
			'Confirmar início de análise? Após confirmar, não será mais possível alterar os preços de concorrentes.',
			{
				onYes: () => {
					PesquisaAPI.iniciarAnalise(pesquisa.uuid, {})
						.then(() => onIniciado())
						.catch(defaultProcessCatch(errors => setErrors(errors)));
				},
			})
	}

	if (!concorrentes) return null;

	//const registros = produtos.map(p => {
	//	codigo: p.id,
	//	preco_venda: valoresConcorrentes[`${c.uuid}_${p.uuid}`]
	//})

	return (
		<React.Fragment>
			<Page className={classes.root}
				title={`Competitividade de Preços | Relatórios - ${pesquisa.descricao}`}>
				<Container maxWidth={false}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={12}>
							<TableContainer component={Paper} className={classes.tableResponsive}>
								<TableSort rows={produtos} size="small" >
									<TableSortColumn rowNumber={1} disabled colSpanHead={3} title=" " />
									{concorrentes.map((c, index) => (
										<TableSortColumn key={index}
											rowNumber={1}
											title={c.nome || c.razao_social}
											disabled
											classHead={classes.columnConcorrente}
										/>
									))}

									<TableSortColumn rowNumber={2} field="codigo" title="Código" width={170} />
									<TableSortColumn rowNumber={2} field="codigo_barra" title="Código de Barras" width={180} />
									<TableSortColumn rowNumber={2} field="descricao" title="Descrição" />

									{concorrentes.map((c, index) => (
										<TableSortColumn key={index}
											disabled
											title="Preço Venda"
											rowNumber={2}
											field="preco_venda"
											classHead={classes.columnConcorrente}
											classBody={classnames(classes.columnConcorrente)}
											width={160}
											formatter={(valor, p) =>
												<CustomTextField
													value={valoresConcorrentes[`${c.uuid}_${p.uuid}`]}
													onChange={value => handleChangePrecoVenda(p, c, value)}
													errorText={filterErrors(errors, `produto[${p.uuid}].concorrente[${c.uuid}]`)} />}
										/>
									))}
								</TableSort>
							</TableContainer>

							<div style={{ textAlign: 'right', marginTop: 16 }}>
								<Button onClick={iniciarAnalise} variant="outlined" color="primary">
									Iniciar Análise
								</Button>
							</div>
						</Grid>
					</Grid>
				</Container>
			</Page>
		</React.Fragment >
	);
}

export default PesquisaPrecosConcorrentes;