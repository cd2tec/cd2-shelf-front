import React from 'react';
import { RelatorioAPI } from '../../../services/api';

import VisualizarRelatorio from '../VisualizarRelatorio';

function WorkflowFluxosStatus({ relatorio, ...props }) {
	const api = RelatorioAPI.pricingWorkflowStatus.bind(RelatorioAPI);
	return <VisualizarRelatorio relatorio={relatorio} api={api} {...props} />;
}

export default WorkflowFluxosStatus;