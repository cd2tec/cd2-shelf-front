import React from 'react';
import { Typography } from '@material-ui/core';

import SingleStat from '../components/SingleStat';
import { AnalyticsAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import TableDialog from '../components/TableDialog';

const IndicadorLucroRecuperado = ({ periodo }) => (
	<SingleStat
		tipo="valor"
		title="Lucro recuperado"
		helpText="Simulador de Lucro recuperado a partir da Gestão de Categorias e Ação de Vendas"
		promise={AnalyticsAPI.lucroRecuperado.bind(AnalyticsAPI)}
		promiseParams={periodo}
		onClick={({ setDialog }) => setDialog(
			<TableDialog
				title="Lucro: Por Departamento"
				fields={[
					{ name: 'codigo', title: 'Código', align: 'right' },
					{ name: 'descricao', title: 'Descrição' },
					{
						name: 'valor',
						title: 'Valor',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					}
				]}
				promise={AnalyticsAPI.lucroRecuperado.bind(AnalyticsAPI)}
				promiseParams={periodo}
				onClose={() => setDialog(null)}
				onClick={(departamento, { setDialog }) => setDialog(
					<TableDialog
						title={
							<React.Fragment>
								Lucro: Por Categoria
								<Typography>
									Departamento: {departamento.obj.descricao}
								</Typography>
							</React.Fragment>
						}
						fields={[
							{ name: 'codigo', title: 'Código', align: 'right' },
							{ name: 'descricao', title: 'Descrição' },
							{
								name: 'valor',
								title: 'Valor',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							}
						]}
						promise={AnalyticsAPI.lucroRecuperado.bind(AnalyticsAPI)}
						promiseParams={{ ...periodo, departamento: departamento.obj.uuid }}
						onClose={() => setDialog(null)}
						onClick={(categoria, { setDialog }) => setDialog(
							<TableDialog
								maxWidth="md"
								title={
									<React.Fragment>
										Lucro: Por Produto
										<Typography>
											Categoria: {departamento.obj.descricao} {'>'} {categoria.obj.descricao}
										</Typography>
									</React.Fragment>}
								fields={[
									{ name: 'codigo', title: 'Código', align: 'right' },
									{ name: 'descricao', title: 'Descrição' },
									{ name: 'marca', title: 'Marca' },
									{ name: 'complemento', title: 'Complemento' },
									{
										name: 'valor',
										title: 'Valor',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									}
								]}
								promise={AnalyticsAPI.lucroRecuperado.bind(AnalyticsAPI)}
								promiseParams={{
									...periodo,
									departamento: departamento.obj.uuid,
									categoria: categoria.obj.uuid,
								}}
								onClose={() => setDialog(null)} />
						)} />
				)} />
		)} />
)

export default IndicadorLucroRecuperado;