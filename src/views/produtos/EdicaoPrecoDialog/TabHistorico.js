import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { TableSort, TableSortColumn } from '../../../components/material';
import { defaultProcessCatch, FluxoAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';

const TabHistorico = ({ produto, produtoUnidade, fluxoUUID }) => {
	const [historico, setHistorico] = useState([]);

	useEffect(() => {
		FluxoAPI.getHistoricoProdutoFluxos(produto.uuid, produtoUnidade.unidade.uuid)
			.then(rs => setHistorico(rs.unidades || []))
			.catch(defaultProcessCatch());
	}, [produto.uuid, produtoUnidade.unidade.uuid]);

	const lista = list(historico.find(h => h.fluxo.uuid === fluxoUUID));

	return (
		<TableSort size="small" rows={lista}>
			<TableSortColumn field="descricao" title="Campo" width={220} />
			<TableSortColumn field="de" title="De" width={120} formatter={(_, v) => valorAlteracaoFluxoByTipo(v.tipo, v.campo, v.de)} />
			<TableSortColumn field="para" title="Para" formatter={(_, v) => valorAlteracaoFluxoByTipo(v.tipo, v.campo, v.para)} />
		</TableSort>
	);
}

export default TabHistorico;

function list(historico) {
	if (historico) {
		const { update } = historico.produto_unidade;
		return update.alteracoes;
	}
	return [];
}

function valorAlteracaoFluxoByTipo(tipo, campo, valor) {
	let field = campo.split('.');
	switch (tipo) {
		case 'bool':
			return valor === 'true' ? 'Ativo' : 'Desativado'
		case 'date':
			return moment(valor).format("DD/MM/YYYY")
		case 'double':
			if (field[1]) {
				if (field[1] === 'valor') {
					return `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`
				} else if (field[1] === 'fator') {
					return numberFormat(valor, DECIMAIS.QUANTIDADES)
				} else {
					return `${numberFormat(valor, DECIMAIS.PERCENTUAL)}%`
				};
			}
			return valor
		default:
			return '-'
	}
}