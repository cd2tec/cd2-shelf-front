import React, { useEffect, useState } from 'react';
import { defaultProcessCatch, FluxoAPI, fluxoOrigemText, RelatorioAPI } from '../../../services/api';

import VisualizarRelatorio from '../VisualizarRelatorio';

function WorkflowProdutos({ relatorio, ...props }) {
	const [loading, setLoading] = useState(true);
	const [fluxos, setFluxos] = useState([]);

	useEffect(() => {
		FluxoAPI.listFluxos()
			.finally(() => setLoading(false))
			.then(rs => setFluxos((rs.fluxos || []).map(f => ({
				value: f.uuid,
				description: `${fluxoOrigemText(f.origem)} - ${f.nome}`,
			}))))
			.catch(defaultProcessCatch());
	}, []);

	return <VisualizarRelatorio
		relatorio={relatorio}
		api={RelatorioAPI.pricingWorkflowProdutos.bind(RelatorioAPI)}
		filtros={[
			{
				field: 'fluxo',
				label: `Fluxo${loading ? ' (Carregando...)' : ''}`,
				values: fluxos.sort((a, b) => a.description > b.description ? 1 : (a.description < b.description ? -1 : 0)),
			}
		]}
		{...props} />;
}

export default WorkflowProdutos;