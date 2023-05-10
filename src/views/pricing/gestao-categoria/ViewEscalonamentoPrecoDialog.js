import React, { useEffect, useState } from 'react';
import {
	Button, Dialog, DialogActions, DialogContent, DialogTitle,
	Typography, Grid, MenuItem,
} from '@material-ui/core';
import { SelectField } from '../../../components/material';
import { defaultProcessCatch, ProdutoAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';

const ViewEscalonamentoPrecoDialog = ({ categoria, marca, onClose, unidades = [] }) => {
	const [produtos, setProdutos] = useState([]);
	const [form, setForm] = useState({
		unidade: unidades.length ? unidades[0].uuid : '',
	});
	const onChangeFiltro = v => setForm(state => ({ ...state, ...v }))

	useEffect(() => {
		ProdutoAPI.escalonamentoPreco(categoria.uuid, form.unidade, marca)
			.then(rs => setProdutos(rs.produtos || []))
			.catch(defaultProcessCatch());
	}, [categoria.uuid, marca, form.unidade])

	return (
		<Dialog open={true} maxWidth="lg" fullWidth>
			<DialogTitle>
				<Grid container spacing={1}>
					<Grid item xs={8}>
						Escalonamento de Preços
						<Typography>Catégoria: {categoria.nome}</Typography>
					</Grid>
					<Grid item xs={4}>
						<SelectField margin="dense"
							label="Unidades"
							value={form.unidade}
							onChange={unidade => onChangeFiltro({ unidade })}>
							{unidades.map((u, k) => {
								return (
									<MenuItem key={k} value={u.uuid}>{u.nome}</MenuItem>
								);
							})}
						</SelectField>
					</Grid>
				</Grid>
			</DialogTitle>

			<DialogContent style={{ padding: 0 }} dividers>
				<TableSort rows={produtos} size="small">
					<TableSortColumn field="produto.codigo" title="Código" />
					<TableSortColumn field="produto.descricao" title="Produto" />
					<TableSortColumn field="produto.marca" title="Marca" />
					<TableSortColumn field="produto.complemento" title="Complemento" />

					<TableSortColumn
						field="preco_atual"
						title="Preço de Venda"
						align="right"
						width={170}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

					<TableSortColumn
						field="margem"
						title="Margem"
						align="right"
						width={90}
						formatter={v => `${numberFormat(v, DECIMAIS.MARGEM_LUCRO)} %`} />
				</TableSort>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ViewEscalonamentoPrecoDialog;