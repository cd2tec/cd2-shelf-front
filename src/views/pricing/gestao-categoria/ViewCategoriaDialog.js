import React, { useState, useEffect } from 'react';

import {
	Button, colors, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
	makeStyles, Typography, TableRow, TableCell, TableFooter,
} from '@material-ui/core';
import { Visibility as ViewIcon } from '@material-ui/icons';

import { defaultProcessCatch, GestaoCategoriaAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import ViewCategoriaMarcaDialog from './ViewCategoriaMarcaDialog';
import { TableSort, TableSortColumn } from '../../../components/material';
import ViewEscalonamentoPrecoDialog from './ViewEscalonamentoPrecoDialog';
import { showLoading } from '../../../utils/loading';
import alerts from '../../../utils/alerts';

const useStyles = makeStyles(() => ({
	cellPositivo: {
		color: 'green !important',
	},
	cellNegativo: {
		color: 'red !important'
	},
	'curva-A': {
		backgroundColor: '#CBDCB8 !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
	'curva-B': {
		backgroundColor: '#C0D5EC !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
	'curva-C': {
		backgroundColor: '#FEE49F !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
	'curva-D': {
		backgroundColor: '#DBDBDB !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
	'curva-E': {
		backgroundColor: '#F7CFB1 !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
	'sem-movimento': {
		backgroundColor: '#ADADAD !important',
		'&:hover': {
			backgroundColor: `${colors.grey[400]} !important`,
			'& td': {
				fontWeight: 500,
			},
		},
	},
}));

const ViewCategoriaDialog = ({ processo, categoria, unidades, semMovimentacao = false, onClose }) => {
	const classes = useStyles();
	const [analise, setAnalise] = useState(null);
	const [dialog, setDialog] = useState(null);

	useEffect(() => {
		showLoading(
			'Carregando marcas...',
			GestaoCategoriaAPI.calcularMarcasCategoria(
				processo.uuid,
				categoria.categoria.uuid,
				{ unidades: (unidades || []).map(u => u.uuid), sem_movimentacao: semMovimentacao })
				.then(rs => setAnalise(rs))
				.catch(defaultProcessCatch()));
	}, [processo.uuid, categoria.categoria.uuid, unidades, semMovimentacao]);

	const openMarca = marca => setDialog(
		<ViewCategoriaMarcaDialog
			categoria={categoria}
			unidades={unidades}
			marca={marca}
			onClose={() => setDialog(null)} />
	)

	const openEscalonamentoPrecos = () => setDialog(
		<ViewEscalonamentoPrecoDialog
			categoria={categoria.categoria}
			unidades={unidades}
			onClose={() => setDialog(null)} />
	)

	const finalizarExecucao = () => {
		alerts.confirmYesNo(
			'Finalizar execução de categoria',
			`Deseja finalizar a execução da categoria: ${categoria.categoria.nome}`,
			{
				onYes: () => {
					GestaoCategoriaAPI.finalizarCategoria(processo.uuid, categoria.categoria.uuid, {})
						.then(() => {
							alerts.snackbars.success('Categoria finalizada com sucesso');
							onClose(true);
						})
						.catch(defaultProcessCatch());
				}
			});
	}

	const ResumoFooter = () => {
		return (
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3}></TableCell>
					<TableCell align="right">
						R$ {numberFormat(analise.stats.valor_venda, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(analise.stats.valor_lucro, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						{numberFormat(analise.stats.margem_minima, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						{numberFormat(analise.stats.margem_ideal, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						{numberFormat(analise.stats.margem_media, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell
						align="right"
						className={
							analise.stats.margem_atual > analise.stats.margem_ideal
								? classes.cellPositivo
								: analise.stats.margem_atual < analise.stats.margem_ideal
									? classes.cellNegativo
									: undefined
						}>
						{numberFormat(analise.stats.margem_atual, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(analise.stats.valor_lucro_ideal, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell
						align="right"
						className={
							analise.stats.saldo_lucratividade > 0
								? classes.cellNegativo
								: analise.stats.saldo_lucratividade < 0
									? classes.cellPositivo
									: undefined
						}>
						R$ {numberFormat(analise.stats.saldo_lucratividade, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableFooter>
		);
	}

	return (
		<React.Fragment>
			<Dialog maxWidth="xl" fullWidth open={true} onClose={onClose}>
				<DialogTitle>
					Categoria: {categoria.categoria.nome}
					<Typography>Departamento: {categoria.departamento.nome}</Typography>
				</DialogTitle>

				<DialogContent style={{ padding: 0 }} dividers>
					{analise
						? (
							<TableSort rows={analise.marcas || []} size="small" stickyHeader stickyFooter
								style={{ zoom: 0.85 }}
								renderRow={(row, dados) => {
									row.className = classes[dados.curva ? `curva-${dados.curva}` : 'sem-movimento'];
									row.onClick = () => openMarca(dados);
									return row;
								}}
								footer={<ResumoFooter />}
							>
								<TableSortColumn field="curva" title="Curva" width={90} />
								<TableSortColumn field="nome" title="Marca" />
								<TableSortColumn field="produtos.length" title="Qtd. Produtos" align="right" />

								<TableSortColumn field="stats.valor_venda" title="R$ Venda" width={150} align="right"
									formatter={valor_venda => `R$ ${numberFormat(valor_venda, DECIMAIS.VALOR)}`} />

								<TableSortColumn field="stats.valor_lucro" title="R$ Lucro" width={150} align="right"
									formatter={valor_lucro => `R$ ${numberFormat(valor_lucro, DECIMAIS.VALOR)}`} />

								<TableSortColumn field="stats.margem_minima" title="Margem Mínima" width={130} align="right"
									formatter={valor => `${numberFormat(valor, DECIMAIS.MARGEM_LUCRO)}%`} />

								<TableSortColumn field="stats.margem_ideal" title="Margem Ideal" width={130} align="right"
									formatter={valor => `${numberFormat(valor, DECIMAIS.MARGEM_LUCRO)}%`} />

								<TableSortColumn width={110} field="stats.margem_media" title="Margem Média" align="right"
									classBody={(_, c) =>
										c.margem_media > c.margem_ideal
											? classes.cellPositivo
											: c.margem_media < c.margem_ideal
												? classes.cellNegativo
												: undefined
									}
									formatter={(margem_media) => `${numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)}%`} />

								<TableSortColumn width={110} field="stats.margem_atual" title="Margem Atual" align="right"
									classBody={(_, c) =>
										c.margem_atual > c.margem_ideal
											? classes.cellPositivo
											: c.margem_atual < c.margem_ideal
												? classes.cellNegativo
												: undefined
									}
									formatter={(margem_atual) => `${numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)}%`} />

								<TableSortColumn field="stats.valor_lucro_ideal" title="R$ Lucro Ideal" width={150} align="right"
									formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`} />

								<TableSortColumn field="stats.saldo_lucratividade" title="Saldo Lucrativo" width={150} align="right"
									classBody={valor =>
										valor > 0
											? classes.cellPositivo
											: valor < 0
												? classes.cellNegativo
												: undefined}
									formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`} />

								<TableSortColumn width={50}
									formatter={(_, m) => <IconButton size="small" onClick={() => openMarca(m)}>
										<ViewIcon />
									</IconButton>}
								/>

							</TableSort>
						)
						: <Typography>Carregando...</Typography>}
				</DialogContent>

				<DialogActions>
					<Button style={{ marginRight: 'auto' }} color="secondary" onClick={openEscalonamentoPrecos}>
						Escalonamento de Preços
					</Button>

					<Button variant="outlined" color="secondary" onClick={finalizarExecucao}>
						Finalizar Execução
					</Button>

					<Button onClick={onClose}>Fechar</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}

export default ViewCategoriaDialog;