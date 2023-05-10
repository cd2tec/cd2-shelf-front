import React from 'react';
import { RelatorioAPI } from '../../../services/api';

import VisualizarRelatorio from '../VisualizarRelatorio';

function PrecificacaoPrecosAlterados({ relatorio, ...props }) {
	const api = RelatorioAPI.pricingPrecificacaoPrecosAlterados.bind(RelatorioAPI);
	return <VisualizarRelatorio relatorio={relatorio} api={api} {...props} />;
}

export default PrecificacaoPrecosAlterados;