import React, { useEffect, useState } from 'react';
import { defaultProcessCatch, PesquisaAPI, RelatorioAPI } from '../../../services/api';

import VisualizarRelatorio from '../VisualizarRelatorio';

function CompetitividadeComparativo({ relatorio, ...props }) {
	const [pesquisas, setPesquisas] = useState([]);

	useEffect(() => {
		PesquisaAPI.list()
			.then(rs => setPesquisas(rs.pesquisas || []))
			.catch(defaultProcessCatch());
	}, []);

	return <VisualizarRelatorio
		relatorio={relatorio}
		api={RelatorioAPI.pricingCompetitividadeComparativo.bind(RelatorioAPI)}
		filtros={[
			{
				field: 'pesquisa',
				label: 'Pesquisa',
				values: pesquisas.map(p => ({ value: p.uuid, description: p.descricao })),
			}
		]}
		{...props} />;
}

export default CompetitividadeComparativo;