import React from 'react';
import { Typography } from '@material-ui/core';

import SingleStat from '../components/SingleStat';
import { AnalyticsAPI } from '../../../services/api';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import TableDialog from '../components/TableDialog';

const IndicadorEstoqueAtual = ({ periodo }) => (
	<SingleStat
		tipo="valor"
		title="Estoque"
		helpText="Valor do estoque na data atual"
		promise={AnalyticsAPI.valorEstoqueAtual.bind(AnalyticsAPI)}
		promiseParams={periodo}
		onClick={({ setDialog }) => setDialog(
			<TableDialog
				title="Estoque: Por Departamento"
				maxWidth="xl"
				fields={[
					{ name: 'codigo', title: 'Código', align: 'right' },
					{ name: 'descricao', title: 'Descrição' },
					{
						name: 'quantidade_estoque',
						title: 'Quantidade em Estoque',
						align: 'right',
						format: v => numberFormat(v, DECIMAIS.QUANTIDADES),
					},
					{
						name: 'valor_venda',
						title: 'R$ Estoque em Preço de Venda',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'valor_compra',
						title: 'R$ Estoque em Preço de Compra',
						align: 'right',
						format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
					},
					{
						name: 'giro_dias',
						title: 'Giro em dias',
						align: 'right',
						format: v => numberFormat(v, 0),
					},
				]}
				promise={AnalyticsAPI.valorEstoqueAtual.bind(AnalyticsAPI)}
				promiseParams={periodo}
				onClose={() => setDialog(null)}
				onClick={(departamento, { setDialog }) => setDialog(
					<TableDialog
						maxWidth="xl"
						title={
							<React.Fragment>
								Estoque: Por Categoria
								<Typography>
									Departamento: {departamento.obj.descricao}
								</Typography>
							</React.Fragment>
						}
						fields={[
							{ name: 'codigo', title: 'Código', align: 'right' },
							{ name: 'descricao', title: 'Descrição' },
							{
								name: 'quantidade_estoque',
								title: 'Quantidade em Estoque',
								align: 'right',
								format: v => numberFormat(v, DECIMAIS.QUANTIDADES),
							},
							{
								name: 'valor_venda',
								title: 'R$ Estoque em Preço de Venda',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'valor_compra',
								title: 'R$ Estoque em Preço de Compra',
								align: 'right',
								format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
							},
							{
								name: 'giro_dias',
								title: 'Giro em dias',
								align: 'right',
								format: v => numberFormat(v, 0),
							},
						]}
						promise={AnalyticsAPI.valorEstoqueAtual.bind(AnalyticsAPI)}
						promiseParams={{ ...periodo, departamento: departamento.obj.uuid }}
						onClose={() => setDialog(null)}
						onClick={(categoria, { setDialog }) => setDialog(
							<TableDialog
								maxWidth="xl"
								title={
									<React.Fragment>
										Estoque: Por Produto
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
										name: 'quantidade_estoque',
										title: 'Quantidade em Estoque',
										align: 'right',
										format: v => numberFormat(v, DECIMAIS.QUANTIDADES),
									},
									{
										name: 'valor_venda',
										title: 'R$ Estoque em Preço de Venda',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'valor_compra',
										title: 'R$ Estoque em Preço de Compra',
										align: 'right',
										format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
									},
									{
										name: 'giro_dias',
										title: 'Giro em dias',
										align: 'right',
										format: v => numberFormat(v, 0),
									},
								]}
								promise={AnalyticsAPI.valorEstoqueAtual.bind(AnalyticsAPI)}
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

export default IndicadorEstoqueAtual;