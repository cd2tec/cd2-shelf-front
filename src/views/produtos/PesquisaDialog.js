import React, { useState, useEffect } from 'react';
import {
	Dialog, DialogTitle, DialogActions, Button,
	DialogContent, makeStyles, Checkbox, Grid,
} from '@material-ui/core';
import { ProdutoAPI, defaultProcessCatch } from '../../services/api';
import { TextField, TableSort, TableSortColumn } from '../../components/material';

const useStyles = makeStyles(() => ({
	table: {
		'& tfoot > tr > td': {
			bottom: 0,
			left: 0,
			position: 'sticky',
			borderTop: '1px solid rgba(224, 224, 224, 1)',
			backgroundColor: '#fff',
		},
	},
}))

let handleSearch;

const PesquisaDialog = ({ selecionados = [], onChange, onClose, multiple = true }) => {
	const classes = useStyles();
	const [filtroCodigo, setFiltroCodigo] = useState('');
	const [filtroDescricao, setFiltroDescricao] = useState('');
	const [produtos, setProdutos] = useState([]);
	const [countProdutos, setCountProdutos] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});
	useEffect(() => {
		clearTimeout(handleSearch);
		handleSearch = setTimeout(() => {
			ProdutoAPI.search(
				{
					page_number: page.page,
					page_size: page.perPage,
					filtros: {
						codigo: filtroCodigo,
						descricao: filtroDescricao,
					},
				})
				.then(rs => {
					setProdutos(rs.produtos || []);
					setCountProdutos(rs.total_count || 0);
				})
				.catch(defaultProcessCatch());
		}, 500);
	}, [page.page, page.perPage, filtroCodigo, filtroDescricao]);

	const toggleSelecionado = (produto, selecionar) => {
		if (!multiple) {
			onClose(produto);
			return;
		}
		if (selecionar) {
			onChange([...selecionados, produto]);
		} else {
			onChange(selecionados.filter(p => p.uuid !== produto.uuid));
		}
	}

	return (
		<Dialog open={true} fullWidth maxWidth="md" onClose={() => onClose()}>
			<DialogTitle>
				Pequisa de Produtos
				<Grid container spacing={2}>
					<Grid item xs={3}>
						<TextField
							autoFocus
							label="Código"
							value={filtroCodigo}
							onChange={v => setFiltroCodigo(v)} />
					</Grid>
					<Grid item xs={9}>
						<TextField
							label="Descrição"
							value={filtroDescricao}
							onChange={v => setFiltroDescricao(v)} />
					</Grid>
				</Grid>
			</DialogTitle>

			<DialogContent style={{ padding: 0 }}>
				<TableSort rows={produtos} stickyHeader size="small"
					page={page}
					className={classes.table}
					onChangePagination={setPage}
					count={countProdutos}
					onClick={p => {
						const checked = !!selecionados.filter(s => s.uuid === p.uuid).length;
						toggleSelecionado(p, !checked)
					}}>
					<TableSortColumn field="codigo" title="Código" />
					<TableSortColumn field="codigo_barra" title="Código Barra" />
					<TableSortColumn field="descricao" title="Descrição" />
					<TableSortColumn field="marca" title="Marca" />
					<TableSortColumn field="complemento" title="Complemento" />
					{multiple ? (
						<TableSortColumn width={50} padding="checkbox"
							formatter={(_, p) => {
								const checked = !!selecionados.filter(s => s.uuid === p.uuid).length;
								return (
									<Checkbox
										checked={checked}
										disabled={!multiple && !!selecionados.length}
										onChange={() => toggleSelecionado(p, !checked)} />
								);
							}}
						/>
					) : null}
				</TableSort>
			</DialogContent>

			<DialogActions>
				<Button onClick={() => onClose()}>
					Fechar
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default PesquisaDialog;