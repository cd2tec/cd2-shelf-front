import React from 'react';
import { Typography } from '@material-ui/core';

import SingleStat from '../components/SingleStat';
import { AnalyticsAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import TableDialog from '../components/TableDialog';

const IndicadorCompra = ({ periodo }) => (
	<SingleStat
		tipo="valor"
		title="Compra"
		helpText="Valor da compra realizada no período"
		promise={AnalyticsAPI.totalCompraMes.bind(AnalyticsAPI)}
		promiseParams={periodo}
		onClick={({ setDialog }) => setDialog(
			<TableDialog
				title="Compra: Por Departamento"
				maxWidth="xl"
				fields={[
					{ name: 'codigo', title: 'Código', align: 'right' },
					{ name: 'descricao', title: 'Descrição' },
					{
						name: 'valor_bruto',
						title: 'R$ Compra Bruta',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'valor_devolucoes',
						title: 'R$ Devoluções',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'valor_meta',
						title: 'R$ Meta',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'valor_liquido',
						title: 'R$ Compra Líquida',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'valor_transferencia',
						title: 'R$ Transferência',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'atingido_meta_liquido',
						title: '% Atingido',
						align: 'right',
						format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
					}
				]}
				promise={AnalyticsAPI.totalCompraMes.bind(AnalyticsAPI)}
				promiseParams={periodo}
				onClose={() => setDialog(null)}
				onClick={(departamento, { setDialog }) => setDialog(
					<TableDialog
						title={
							<React.Fragment>
								Compra: Por Categoria
								<Typography>
									Departamento: {departamento.obj.descricao}
								</Typography>
							</React.Fragment>
						}
						fields={[
							{ name: 'codigo', title: 'Código', align: 'right' },
							{ name: 'descricao', title: 'Descrição' },
							{
								name: 'valor_bruto',
								title: 'R$ Compra Bruta',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'valor_devolucoes',
								title: 'R$ Devoluções',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'valor_liquido',
								title: 'R$ Compra Líquida',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'valor_transferencia',
								title: 'R$ Transferência',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
						]}
						promise={AnalyticsAPI.totalCompraMes.bind(AnalyticsAPI)}
						promiseParams={{ ...periodo, departamento: departamento.obj.uuid }}
						onClose={() => setDialog(null)}
						onClick={(categoria, { setDialog }) => setDialog(
							<TableDialog
								title={
									<React.Fragment>
										Compra: Por Produto
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
										name: 'valor_bruto',
										title: 'R$ Compra Bruta',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'valor_devolucoes',
										title: 'R$ Devoluções',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'valor_liquido',
										title: 'R$ Compra Líquida',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'valor_transferencia',
										title: 'R$ Transferência',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
								]}
								promise={AnalyticsAPI.totalCompraMes.bind(AnalyticsAPI)}
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

export default IndicadorCompra;