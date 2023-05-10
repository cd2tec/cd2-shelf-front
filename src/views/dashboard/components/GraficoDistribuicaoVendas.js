import React from 'react';
import { colors, Typography } from '@material-ui/core';

import PieChart from './PieChart';
import TableDialog from '../components/TableDialog';

import { DECIMAIS, numberFormat } from '../../../utils/formats';
import { AnalyticsAPI } from '../../../services/api';

const GraficoDistribuicaoVendas = ({ periodo }) => {
	return (
		<PieChart
			title="Distribuição de Vendas"
			helpText="Representação do valor da venda regular x venda em oferta sobre a venda total do período"
			promise={AnalyticsAPI.distribuicaoVendas.bind(AnalyticsAPI)}
			promiseParams={periodo}
			values={[
				{ label: 'normal', desc: 'NORMAL', color: colors.green[50], borderColor: colors.green[100] },
				{ label: 'oferta', desc: 'OFERTA', color: colors.red[50], borderColor: colors.red[100] },
			]}
			infoLabel="Margem"
			value={{ prefix: 'R$ ', format: DECIMAIS.VALOR }}
			infoValue={{ suffix: '%', format: DECIMAIS.MARGEM_LUCRO }}
			onClick={({ setDialog }) => setDialog(
				<TableDialog
					title="Distribuição de Vendas: Por Departamento"
					maxWidth="xl"
					fields={[
						{ name: 'codigo', title: 'Código', align: 'right' },
						{ name: 'descricao', title: 'Descrição' },
						{
							name: 'valor_venda_normal',
							title: 'R$ Venda Normal',
							align: 'right',
							format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
						},
						{
							name: 'valor_venda_oferta',
							title: 'R$ Venda Oferta',
							align: 'right',
							format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
						},
						{
							name: 'media_margem_normal',
							title: 'Média Margem Normal',
							align: 'right',
							format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
						},
						{
							name: 'media_margem_oferta',
							title: 'Média Margem Oferta',
							align: 'right',
							format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
						},
						{
							name: 'percentual_venda_normal',
							title: '% Venda Normal',
							align: 'right',
							format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
						},
						{
							name: 'percentual_venda_oferta',
							title: '% Venda em Oferta',
							align: 'right',
							format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
						},
					]}
					promise={AnalyticsAPI.distribuicaoVendasDetalhado.bind(AnalyticsAPI)}
					promiseParams={periodo}
					onClose={() => setDialog(null)}
					onClick={(departamento, { setDialog }) => setDialog(
						<TableDialog
							title={
								<React.Fragment>
									Distribuição de Vendas: Por Categoria
									<Typography>
										Departamento: {departamento.obj.descricao}
									</Typography>
								</React.Fragment>
							}
							maxWidth="xl"
							fields={[
								{ name: 'codigo', title: 'Código', align: 'right' },
								{ name: 'descricao', title: 'Descrição' },
								{
									name: 'valor_venda_normal',
									title: 'R$ Venda Normal',
									align: 'right',
									format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
								},
								{
									name: 'valor_venda_oferta',
									title: 'R$ Venda Oferta',
									align: 'right',
									format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
								},
								{
									name: 'media_margem_normal',
									title: 'Média Margem Normal',
									align: 'right',
									format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
								},
								{
									name: 'media_margem_oferta',
									title: 'Média Margem Oferta',
									align: 'right',
									format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
								},
								{
									name: 'percentual_venda_normal',
									title: '% Venda Normal',
									align: 'right',
									format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
								},
								{
									name: 'percentual_venda_oferta',
									title: '% Venda em Oferta',
									align: 'right',
									format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
								},
							]}
							promise={AnalyticsAPI.distribuicaoVendasDetalhado.bind(AnalyticsAPI)}
							promiseParams={{ ...periodo, departamento: departamento.obj.uuid }}
							onClose={() => setDialog(null)}
							onClick={(categoria, { setDialog }) => setDialog(
								<TableDialog
									title={
										<React.Fragment>
											Distribuição de Vendas: Por Produto
											<Typography>
												Categoria: {departamento.obj.descricao} {'>'} {categoria.obj.descricao}
											</Typography>
										</React.Fragment>}
									maxWidth="xl"
									fields={[
										{ name: 'codigo', title: 'Código', align: 'right' },
										{ name: 'descricao', title: 'Descrição' },
										{ name: 'marca', title: 'Marca' },
										{ name: 'complemento', title: 'Complemento' },
										{
											name: 'valor_venda_normal',
											title: 'R$ Venda Normal',
											align: 'right',
											format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
										},
										{
											name: 'valor_venda_oferta',
											title: 'R$ Venda Oferta',
											align: 'right',
											format: v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`,
										},
										{
											name: 'media_margem_normal',
											title: 'Média Margem Normal',
											align: 'right',
											format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
										},
										{
											name: 'media_margem_oferta',
											title: 'Média Margem Oferta',
											align: 'right',
											format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
										},
										{
											name: 'percentual_venda_normal',
											title: '% Venda Normal',
											align: 'right',
											format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
										},
										{
											name: 'percentual_venda_oferta',
											title: '% Venda em Oferta',
											align: 'right',
											format: v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`,
										},
									]}
									promise={AnalyticsAPI.distribuicaoVendasDetalhado.bind(AnalyticsAPI)}
									promiseParams={{
										...periodo,
										departamento: departamento.obj.uuid,
										categoria: categoria.obj.uuid,
									}}
									onClose={() => setDialog(null)} />
							)} />
					)} />
			)}
		/>
	);
}

export default GraficoDistribuicaoVendas;