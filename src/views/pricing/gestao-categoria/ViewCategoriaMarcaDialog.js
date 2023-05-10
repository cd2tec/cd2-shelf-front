import React, { useState } from 'react';

import {
	Button, colors, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles,
	TableCell, TableFooter, TableRow, Typography,
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';

import { DECIMAIS, numberFormat } from '../../../utils/formats';
import { TableSort, TableSortColumn } from '../../../components/material';
import ViewEscalonamentoPrecoDialog from './ViewEscalonamentoPrecoDialog';
import EdicaoPrecoDialog from '../../produtos/EdicaoPrecoDialog';


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
}));

const ViewCategoriaMarcaDialog = ({ categoria, marca, unidades, onClose }) => {
	const classes = useStyles();
	const [dialog, setDialog] = useState(null);

	const openProduto = ({ produto: { produto } }) => setDialog(
		<EdicaoPrecoDialog
			produtoUUID={produto.uuid}
			fluxoUUID={categoria.status.fluxo.uuid}
			onClose={() => setDialog(null)} />
	)

	const openEscalonamentoPrecos = () => setDialog(
		<ViewEscalonamentoPrecoDialog
			marca={marca.nome}
			unidades={unidades}
			categoria={categoria.categoria}
			onClose={() => setDialog(null)} />
	)

	const ResumoFooter = () => {
		return (
			<TableFooter>
				<TableRow>
					<TableCell colSpan={9}></TableCell>
					<TableCell align="right">
						{numberFormat(marca.stats.quantidade, DECIMAIS.QUANTIDADES)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(marca.stats.valor_venda, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(marca.stats.valor_lucro, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						{numberFormat(marca.stats.margem_minima, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						{numberFormat(marca.stats.margem_ideal, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						{numberFormat(marca.stats.margem_media, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell
						align="right"
						className={
							marca.stats.margem_atual > marca.stats.margem_ideal
								? classes.cellPositivo
								: marca.stats.margem_atual < marca.stats.margem_ideal
									? classes.cellNegativo
									: undefined
						}>
						{numberFormat(marca.stats.margem_atual, DECIMAIS.MARGEM_LUCRO)}%
					</TableCell>
					<TableCell align="right">
						R$ {numberFormat(marca.stats.valor_lucro_ideal, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell
						align="right"
						className={
							marca.stats.saldo_lucratividade > 0
								? classes.cellPositivo
								: marca.stats.saldo_lucratividade < 0
									? classes.cellNegativo
									: undefined
						}>
						R$ {numberFormat(marca.stats.saldo_lucratividade * -1, DECIMAIS.VALOR)}
					</TableCell>
					<TableCell align="right">
						{numberFormat(marca.stats.estoque, DECIMAIS.QUANTIDADES)}
					</TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableFooter>
		);
	}

	let rows = [];
	for (const produto of (marca.produtos || [])) {
		for (const unidade of (produto.unidades || [])) {
			rows.push({ unidade, produto });
		}
	}

	return (
		<React.Fragment>
			<Dialog fullScreen open={true} onClose={onClose}>
				<DialogTitle>
					Marca: {marca.nome}
					<Typography>
						Categoria: {categoria.departamento.nome}
						{' > '}
						{categoria.categoria.nome}
					</Typography>
				</DialogTitle>

				<DialogContent style={{ padding: 0, zoom: '90%' }} dividers>
					<TableSort size="small" rows={rows} stickyHeader stickyFooter
						style={{ zoom: 0.85 }}
						renderRow={(row, dados) => {
							row.className = classes[`curva-${dados.produto.curva}`];
							row.onClick = () => openProduto(dados);
							return row;
						}}
						footer={<ResumoFooter />}
					>
						<TableSortColumn field="produto.curva" title="Curva" width={50} />
						<TableSortColumn field="unidade.unidade.unidade.codigo" title="Código Unidade" width={120} align="right" />

						<TableSortColumn field="produto.produto.codigo" title="Código" width={100} />
						<TableSortColumn field="produto.produto.descricao" title="Produto" />
						<TableSortColumn field="produto.produto.complemento" title="Complemento" />

						<TableSortColumn field="unidade.unidade.preco_compra" title="Preço Compra Unitário" width={120} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.unidade.custo_total" title="Custo Total Unitário" width={120} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.unidade.preco_atual" title="Preço Venda Unitário" width={120} align="right"
							className={(_, p) => p.unidade.unidade.oferta.ativo && classes.cellNegativo}
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.unidade.stats.lucro_atual" title="R$ Lucro Unitário" width={140} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.stats.quantidade" title="Quantidade" width={120} align="right"
							formatter={v => numberFormat(v, DECIMAIS.QUANTIDADES)} />

						<TableSortColumn field="unidade.stats.valor_venda" title="R$ Venda" width={140} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />


						<TableSortColumn field="unidade.stats.valor_lucro" title="R$ Lucro" width={140} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn width={110} field="unidade.stats.margem_minima" title="Margem Mínima" align="right"
							formatter={(margem_minima) => `${numberFormat(margem_minima, DECIMAIS.MARGEM_LUCRO)}%`} />

						<TableSortColumn width={110} field="unidade.stats.margem_ideal" title="Margem Ideal" align="right"
							formatter={(margem_ideal) => `${numberFormat(margem_ideal, DECIMAIS.MARGEM_LUCRO)}%`} />

						<TableSortColumn width={110} field="unidade.stats.margem_media" title="Margem Média" align="right"
							classBody={(_, c) =>
								c.margem_media > c.margem_ideal
									? classes.cellPositivo
									: c.margem_media < c.margem_ideal
										? classes.cellNegativo
										: undefined
							}
							formatter={(margem_media) => `${numberFormat(margem_media, DECIMAIS.MARGEM_LUCRO)}%`} />

						<TableSortColumn width={110} field="unidade.stats.margem_atual" title="Margem Atual" align="right"
							classBody={(_, c) =>
								c.margem_atual > c.margem_ideal
									? classes.cellPositivo
									: c.margem_atual < c.margem_ideal
										? classes.cellNegativo
										: undefined
							}
							formatter={(margem_atual) => `${numberFormat(margem_atual, DECIMAIS.MARGEM_LUCRO)}%`} />

						<TableSortColumn field="unidade.stats.valor_lucro_ideal" title="R$ Lucro Ideal" width={140} align="right"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.stats.saldo_lucratividade" title="Saldo Lucrativo" width={140} align="right"
							classBody={valor =>
								valor > 0
									? classes.cellPositivo
									: valor < 0
										? classes.cellNegativo
										: undefined}
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn field="unidade.stats.estoque" title="Estoque Atual" width={130} align="right"
							formatter={v => numberFormat(v, DECIMAIS.QUANTIDADES)} />

						<TableSortColumn width={50} padding="none" align="center"
							formatter={(_, p) => (
								<IconButton size="small" onClick={() => openProduto(p)}>
									<EditIcon />
								</IconButton>
							)}
						/>
					</TableSort>
				</DialogContent>

				<DialogActions>
					<Button style={{ marginRight: 'auto' }} color="secondary" onClick={openEscalonamentoPrecos}>
						Escalonamento de Preços
					</Button>

					<Button onClick={onClose}>Fechar</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}

export default ViewCategoriaMarcaDialog;