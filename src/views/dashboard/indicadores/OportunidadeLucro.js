import React from 'react';
import { Typography } from '@material-ui/core';

import SingleStat from '../components/SingleStat';
import { AnalyticsAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import TableDialog from '../components/TableDialog';

const IndicadorOportunidadeLucro = ({ periodo }) => (
	<SingleStat
		tipo="valor"
		title="Oportunidade de Lucro"
		helpText="Simulador de oportunidade de lucro a partir da Gestão de Categorias e Pricing"
		promise={AnalyticsAPI.oportunidadeLucroMes.bind(AnalyticsAPI)}
		promiseParams={periodo}
		onClick={({ setDialog }) => setDialog(
			<TableDialog
				title="Oportunidade de Lucro: Por Departamento"
				fields={[
					{ name: 'codigo', title: 'Código', align: 'right' },
					{ name: 'descricao', title: 'Descrição' },
					{
						name: 'margem_ideal',
						title: '% Margem Ideal',
						align: 'right',
						format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
					},
					{
						name: 'margem_realizada',
						title: '% Margem Realizada',
						align: 'right',
						format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
					},
					{
						name: 'lucro_ideal',
						title: 'R$ Lucro Ideal',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'lucro_realizado',
						title: 'R$ Lucro Realizado',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'oportunidade_lucro',
						title: 'R$ Oportunidade de Lucro',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
				]}
				promise={AnalyticsAPI.oportunidadeLucroMes.bind(AnalyticsAPI)}
				promiseParams={periodo}
				onClose={() => setDialog(null)}
				onClick={(departamento, { setDialog }) => setDialog(
					<TableDialog
						title={
							<React.Fragment>
								Oportunidade de Lucro: Por Categoria
								<Typography>
									Departamento: {departamento.obj.descricao}
								</Typography>
							</React.Fragment>
						}
						fields={[
							{ name: 'codigo', title: 'Código', align: 'right' },
							{ name: 'descricao', title: 'Descrição' },
							{
								name: 'margem_ideal',
								title: '% Margem Ideal',
								align: 'right',
								format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
							},
							{
								name: 'margem_realizada',
								title: '% Margem Realizada',
								align: 'right',
								format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
							},
							{
								name: 'lucro_ideal',
								title: 'R$ Lucro Ideal',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'lucro_realizado',
								title: 'R$ Lucro Realizado',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'oportunidade_lucro',
								title: 'R$ Oportunidade de Lucro',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
						]}
						promise={AnalyticsAPI.oportunidadeLucroMes.bind(AnalyticsAPI)}
						promiseParams={{ ...periodo, departamento: departamento.obj.uuid }}
						onClose={() => setDialog(null)}
						onClick={(categoria, { setDialog }) => setDialog(
							<TableDialog
								title={
									<React.Fragment>
										Oportunidade de Lucro: Por Produto
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
										name: 'margem_ideal',
										title: '% Margem Ideal',
										align: 'right',
										format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
									},
									{
										name: 'margem_realizada',
										title: '% Margem Realizada',
										align: 'right',
										format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
									},
									{
										name: 'lucro_ideal',
										title: 'R$ Lucro Ideal',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'lucro_realizado',
										title: 'R$ Lucro Realizado',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'oportunidade_lucro',
										title: 'R$ Oportunidade de Lucro',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
								]}
								promise={AnalyticsAPI.oportunidadeLucroMes.bind(AnalyticsAPI)}
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

export default IndicadorOportunidadeLucro;