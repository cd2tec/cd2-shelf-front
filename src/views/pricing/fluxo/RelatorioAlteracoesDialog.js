import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { defaultProcessCatch, FluxoAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import { TableSort, TableSortColumn } from '../../../components/material';

const RelatorioAlteracoesDialog = ({ fluxo, onClose }) => {
	const [produtos, setProdutos] = useState([]);

	useEffect(() => {
		FluxoAPI.relatorioAlteracoesProdutos(fluxo.uuid, 'API')
			.then(rs => setProdutos(rs.produtos || []))
			.catch(defaultProcessCatch());
	}, [fluxo.uuid])

	return (
		<Dialog open={true} maxWidth="lg" fullWidth>
			<DialogTitle>
				Relatório de Alterações de Preços
			</DialogTitle>

			<DialogContent style={{ padding: 0 }} dividers>
				<TableSort rows={produtos} size="small" >
					<TableSortColumn field="produto_unidade.unidade.uuid" title="Unidade"
						formatter={(_, p) => `${p.produto_unidade.unidade.codigo} - ${p.produto_unidade.unidade.nome}`} />

					<TableSortColumn field="produto_unidade.produto.descricao" title="Produto"
						formatter={(_, p) => `${p.produto_unidade.produto.codigo} - ${p.produto_unidade.produto.descricao}`} />

					<TableSortColumn field="produto_unidade.produto.marca" title="Marca" />
					<TableSortColumn field="produto_unidade.produto.complemento" title="Complemento" />

					<TableSortColumn field="update.preco1.valor" title="Preço de Venda" align="right" width={150}
						formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`} />

					<TableSortColumn field="update.oferta.ativo" title="Oferta" align="right" width={90}
						formatter={oferta => oferta ? 'Sim' : 'Não'} />

					<TableSortColumn field="update.oferta.periodo.inicio" title="Período Oferta" align="right"
						width={200}
						formatter={(_, p) => p.update.oferta.periodo.inicio && p.update.oferta.periodo.fim
							? `${p.update.oferta.periodo.inicio ? moment(p.update.oferta.periodo.inicio).format('DD/MM/YYYY') : '-'} até ${p.update.oferta.periodo.fim ? moment(p.update.oferta.periodo.fim).format('DD/MM/YYYY') : '-'}`
							: '-'}
					/>
				</TableSort>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RelatorioAlteracoesDialog;