import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { TableSort, TableSortColumn } from '../../../components/material';
import { defaultProcessCatch, FluxoAPI, fluxoOrigemText, fluxoStatusText } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';

const TabAlteracoes = ({ produto, produtoUnidade }) => {
	const [historico, setHistorico] = useState([]);

	useEffect(() => {
		FluxoAPI.getHistoricoProdutoFluxos(produto.uuid, produtoUnidade.unidade.uuid)
			.then(rs => setHistorico(rs.unidades || []))
			.catch(defaultProcessCatch());
	}, [produto.uuid, produtoUnidade.unidade.uuid]);

	return (
		<TableSort size="small" rows={historico}>
			<TableSortColumn field="produto_unidade.produto_unidade.unidade.nome" title="Unidade" />

			<TableSortColumn field="fluxo.origem" title="Origem"
				formatter={v => fluxoOrigemText(v)} />

			<TableSortColumn field="fluxo.status" title="Situação"
				formatter={v => fluxoStatusText(v)} />

			<TableSortColumn field="fluxo.data_cadastro" title="Data de Cadastro"
				formatter={v => moment(v).format('DD/MM/YYYY')} />

			<TableSortColumn width={150} align="right" field="produto_unidade.preco1" title="Preço"
				formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

			<TableSortColumn width={150} align="right" field="produto_unidade.preco1" title="Margem" />
			<TableSortColumn width={150} align="right" field="produto_unidade.preco1" title="Custo Total" />

			{/* <TableSortColumn width={170} field="produto_unidade.ativo" title="Ativar" />
			<TableSortColumn width={170} field="produto_unidade.bloqueado" title="Bloquear" /> */}
		</TableSort>
	);
}

export default TabAlteracoes;