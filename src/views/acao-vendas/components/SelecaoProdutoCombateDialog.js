import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';

import { ProdutoAPI, defaultProcessCatch, CategoriaAPI } from '../../../services/api';
import { TableSort, TableSortColumn } from '../../../components/material';
import PesquisaProdutosDialog from '../../produtos/PesquisaDialog';
import alerts from '../../../utils/alerts';
import { userCan } from '../../../utils/validation';
import LoggedContext from '../../../context/LoggedContext';


const SelecaoProdutoCombateDialog = ({ produto, onClose }) => {
	const [dialog, setDialog] = useState();
  const { permissoes } = useContext(LoggedContext);
	const [produtos, setProdutos] = useState([]);

	useEffect(() => {
		ProdutoAPI.listSimilares(produto.uuid)
			.then(rs => setProdutos(rs.produtos || []))
			.catch(defaultProcessCatch());
	}, [produto.uuid]);

	const pesquisarProduto = () => setDialog(
		<PesquisaProdutosDialog
			multiple={false}
			onClose={similar => {
				if (!similar) {
					setDialog();
					return;
				}

				if (!similar.categoria) {
					onClose(similar);
					return;
				}

				const hasSimilar = produtos.filter(p => p.categoria.uuid === similar.categoria.uuid).length;
				if (hasSimilar) {
					onClose(similar);
					return;
				}

				alerts.confirmYesNo(
					'Vincular categoria similar',
					`A categoria "${similar.categoria.nome}" não está vinculada como categoria similar de "${produto.categoria.nome}". Deseja vincular?`,
					{
						showCancel: true,
						onYes: () => {
							CategoriaAPI.insertSimilar(produto.categoria.uuid, { categoria_similar_uuid: similar.categoria.uuid })
								.then(() => {
									alerts.snackbars.success('Categoria similar vinculada.');
									onClose(similar);
								})
								.catch(defaultProcessCatch());
						},
						onNo: () => onClose(similar),
					});
			}} />
	)

	return (
		<React.Fragment>
			<Dialog open={true} fullWidth maxWidth="md" onClose={() => onClose()}>
				<DialogTitle>
					Seleção de produtos - Categorias Similares
				</DialogTitle>

				<DialogContent style={{ padding: 0 }}>
					<TableSort rows={produtos} stickyHeader size="small"
						onClick={p => onClose(p)}>
						<TableSortColumn field="codigo" title="Código" />
						<TableSortColumn field="codigo_barra" title="Código Barra" />
						<TableSortColumn field="descricao" title="Descrição" />
						<TableSortColumn field="categoria.nome" title="Categoria" />
						<TableSortColumn field="marca" title="Marca" />
						<TableSortColumn field="complemento" title="Complemento" />
					</TableSort>
				</DialogContent>

				<DialogActions>
          {userCan(permissoes, 'pricing - ação de vendas - adicionar categoria similar') ?
            <Button style={{ marginRight: 'auto' }} color="secondary" onClick={pesquisarProduto}>
						  Pesquisar Produto
					  </Button> : null
          }	

					<Button onClick={() => onClose()}>
						Fechar
				</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}

export default SelecaoProdutoCombateDialog;
