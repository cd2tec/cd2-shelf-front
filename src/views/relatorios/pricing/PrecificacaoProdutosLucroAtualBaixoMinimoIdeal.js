import React from 'react';
import { RelatorioAPI } from '../../../services/api';

import VisualizarRelatorio from '../VisualizarRelatorio';

function PrecificacaoProdutosLucroAtualBaixoMinimoIdeal({ relatorio, ...props }) {
	const api = RelatorioAPI.pricingPrecificacaoProdutosLucroAtualABaixoMinimoIdeal.bind(RelatorioAPI);
	return <VisualizarRelatorio relatorio={relatorio} api={api} {...props} />;
}

export default PrecificacaoProdutosLucroAtualBaixoMinimoIdeal;