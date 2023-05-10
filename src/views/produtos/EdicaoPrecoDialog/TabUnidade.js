import React from 'react';
import moment from 'moment';
import { Box, Grid, Typography, Divider, LinearProgress, InputAdornment } from '@material-ui/core';

import CustomTextField from '../../pricing/competitividade/View/CustomTextField';
import LabelValue from './LabelValue';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import { NumberField } from '../../../components/material';
import { ProdutoUnidadeCampoAdicionalTipo as TiposCampo } from '../../../services/api';

const Curva = ({ label, curva, loading }) => {
	const inactiveColor = '#d1d3d4';
	const curvas = [
		{ curva: 'A', color: '#00a14b' },
		{ curva: 'B', color: '#ffde17' },
		{ curva: 'C', color: '#f26522' },
		{ curva: 'D', color: '#ed1c24' },
		{ curva: 'E', color: '#414042' },
	];

	return (
		<Grid container spacing={3} style={{ margin: 0 }}>
			<Grid item xs style={{ textAlign: 'right' }}>
				<Typography variant="subtitle2" color="primary">{label}:</Typography>
			</Grid>
			<Grid item xs container>
				{loading
					? (
						<Grid item xs={10} style={{ paddingTop: 6 }}>
							<LinearProgress variant="indeterminate" />
						</Grid>
					)
					: curvas.map(c => (
						<Grid key={c.curva} item xs={2} container direction="column" spacing={1}>
							<Grid item xs style={{ textAlign: 'center' }}>
								<div style={{ backgroundColor: c.curva === curva ? c.color : inactiveColor, width: 12, height: 12, borderRadius: 12 }}>&nbsp;</div>
							</Grid>
							<Grid item xs>{c.curva}</Grid>
						</Grid>
					))}

			</Grid>
		</Grid>
	);
}

function formatCampoAdicional(valor, tipo) {
	if (!valor) return '';

	switch (tipo) {
		case 'QUANTIDADES':
			return numberFormat(valor, DECIMAIS.QUANTIDADES);
		case TiposCampo.MOEDA:
			return `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`;
		case TiposCampo.PORCENTAGEM:
			return `${numberFormat(valor, DECIMAIS.PERCENTUAL)}%`;
		case TiposCampo.DATA:
			return moment(valor, 'YYYY-MM-DD').format('DD/MM/YYYY');
		default:
			return valor;
	}
}

const TabUnidade = ({ produtoUnidade, curvas, loadingCurvas, atualizacoes, onChangeField, stats, canEditFieldUnidade }) => {
	const getCurvaVenda = () => {
		const c = curvas && curvas.unidades && curvas.unidades[produtoUnidade.unidade.uuid];
		return c && c.venda;
	}
	const getCurvaLucro = () => {
		const c = curvas && curvas.unidades && curvas.unidades[produtoUnidade.unidade.uuid];
		return c && c.lucro;
	}

	const informacoesAdicionais = [
		{ label: 'Custo de compra', valor: formatCampoAdicional(produtoUnidade.custos.compra, TiposCampo.MOEDA) },
		{ label: 'Custo médio', valor: formatCampoAdicional(produtoUnidade.custos.medio, TiposCampo.MOEDA) },
		{ label: 'Custo empresa', valor: formatCampoAdicional(produtoUnidade.custos.empresa, TiposCampo.MOEDA) },
		{ label: 'Custo de Venda', valor: formatCampoAdicional(produtoUnidade.custos.venda, TiposCampo.MOEDA) },
		{ label: 'Custo fiscal', valor: formatCampoAdicional(produtoUnidade.custos.fiscal, TiposCampo.MOEDA) },
		{ label: 'Custo transf.', valor: formatCampoAdicional(produtoUnidade.custos.transferencia, TiposCampo.MOEDA) },
		{ label: 'Data custos', valor: formatCampoAdicional(produtoUnidade.custos.data, TiposCampo.DATA) },
		{
			label: 'Qtd. Vd. Mês (últimos 3 meses)',
			valor: [
				formatCampoAdicional(stats ? stats.vendas_trimestre[0].valor : 0, 'QUANTIDADES'),
				formatCampoAdicional(stats ? stats.vendas_trimestre[1].valor : 0, 'QUANTIDADES'),
				formatCampoAdicional(stats ? stats.vendas_trimestre[2].valor : 0, 'QUANTIDADES'),
			],
			labelAlign: 'left',
			valueAlign: 'center',
			direction: 'column',
			xsLabel: 12,
			xsValue: 12,
		},
		{
			label: 'Qtd. Vd. Mês Atual',
			valor: formatCampoAdicional(stats ? stats.quantidade_venda_mes_corrente : 0, 'QUANTIDADES'),
		},
		{ label: 'Lucro Méd. Valor', valor: formatCampoAdicional(stats ? stats.valor_lucro_medio : 0, TiposCampo.MOEDA) },
		{ label: 'Lucro Médio %', valor: formatCampoAdicional(stats ? stats.percentual_lucro_medio : 0, TiposCampo.PORCENTAGEM) },
		...(produtoUnidade.campos_adicionais || []).map(ca => ({
			label: ca.titulo,
			valor: formatCampoAdicional(ca.valor, ca.tipo),
		})),

		// { label: 'Preço anterior', valor: 'Valor' },
		// { label: 'Data ult. compra', valor: 'Valor' },
		// { label: 'Simb. Trib.', valor: 'Valor' },
		// { label: 'Data Alt. preço', valor: 'Valor' },

		// Estoque Disponível em Unidade
		// { label: 'Est. Disp. Unid.', valor: 'Valor' },
		//
		// { label: 'Usuário Alt. preço', valor: 'Valor' },
		// { label: 'Qnt. ult. compra und', valor: 'Valor' },

		// Estoque Disponível  em Embalagem
		// { label: 'Est. Disp. emb', valor: 'Valor' },

		// { label: 'Qnt. ult. compra emb.', valor: 'Valor' },
		// { label: 'Qtd. Vd. Média Diária', valor: 'Valor' },
		// { label: 'Fornecedor', valor: 'Valor' },
	];

	return (
		<React.Fragment>
			<Grid container spacing={2}>
				<Grid item xs={9} container spacing={2}>
					<Grid item xs={2}>
						<LabelValue label="Preço Venda 1">
							<CustomTextField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								value={atualizacoes.preco1_valor}
								onChange={preco1_valor => onChangeField({ preco1_valor })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Preço Venda 2">
							<CustomTextField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								value={atualizacoes.preco2_valor}
								onChange={preco2_valor => onChangeField({ preco2_valor })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Preço Venda 3">
							<CustomTextField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								value={atualizacoes.preco3_valor}
								onChange={preco3_valor => onChangeField({ preco3_valor })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Preço Venda 4">
							<CustomTextField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								value={atualizacoes.preco4_valor}
								onChange={preco4_valor => onChangeField({ preco4_valor })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Preço Venda 5">
							<CustomTextField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								value={atualizacoes.preco5_valor}
								onChange={preco5_valor => onChangeField({ preco5_valor })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}></Grid>


					<Grid item xs={1}>
						<LabelValue label="Margem Mín. 1">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco1_margem_minima}
								onChange={preco1_margem_minima => onChangeField({ preco1_margem_minima })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={1}>
						<LabelValue label="Margem 1">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco1_margem}
								onChange={preco1_margem => onChangeField({ preco1_margem })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Margem 2">
							<NumberField
								disabled={true}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco2_margem}
								onChange={preco2_margem => onChangeField({ preco2_margem })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Margem 3">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco3_margem}
								onChange={preco3_margem => onChangeField({ preco3_margem })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Margem 4">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco4_margem}
								onChange={preco4_margem => onChangeField({ preco4_margem })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Margem 5">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco5_margem}
								onChange={preco5_margem => onChangeField({ preco5_margem })}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}></Grid>

					<Grid item xs={2}>
						<LabelValue label="Multiplo 1">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco1_fator}
								onChange={preco1_fator => onChangeField({ preco1_fator })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 2">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco2_fator}
								onChange={preco2_fator => onChangeField({ preco2_fator })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 3">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco3_fator}
								onChange={preco3_fator => onChangeField({ preco3_fator })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 4">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco4_fator}
								onChange={preco4_fator => onChangeField({ preco4_fator })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 5">
							<NumberField
								disabled={!canEditFieldUnidade(produtoUnidade.unidade)}
								variant="standard"
								margin="none"
								decimals={3}
								value={atualizacoes.preco5_fator}
								onChange={preco5_fator => onChangeField({ preco5_fator })} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}></Grid>


					{/* <Grid item xs={2}>
						<LabelValue label="Multiplo 1">
							<TextField
								variant="standard"
								margin="none"
								value={`${numberFormat(produtoUnidade.preco1.fator, DECIMAIS.QUANTIDADES)}`}
								onChange={value => console.log(value)} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 2">
							<TextField
								variant="standard"
								margin="none"
								value={`${numberFormat(produtoUnidade.preco2.fator, DECIMAIS.QUANTIDADES)}`}
								onChange={value => console.log(value)} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 3">
							<TextField
								variant="standard"
								margin="none"
								value={`${numberFormat(produtoUnidade.preco3.fator, DECIMAIS.QUANTIDADES)}`}
								onChange={value => console.log(value)} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 4">
							<TextField
								variant="standard"
								margin="none"
								value={`${numberFormat(produtoUnidade.preco4.fator, DECIMAIS.QUANTIDADES)}`}
								onChange={value => console.log(value)} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}>
						<LabelValue label="Multiplo 5">
							<TextField
								variant="standard"
								margin="none"
								value={`${numberFormat(produtoUnidade.preco5.fator, DECIMAIS.QUANTIDADES)}`}
								onChange={value => console.log(value)} />
						</LabelValue>
					</Grid>
					<Grid item xs={2}></Grid> */}
				</Grid>

				<Grid item xs={3} container spacing={2} direction="column">
					<Grid item xs>
						<Curva label="Curva Venda" curva={getCurvaVenda()} loading={loadingCurvas} />
					</Grid>
					<Grid item xs>
						<Curva label="Curva Lucro" curva={getCurvaLucro()} loading={loadingCurvas} />
					</Grid>
				</Grid>
			</Grid>

			<Box p={1} />
			<Typography variant="h6" color="primary">Informações Adicionais</Typography>
			<Divider />
			<Box p={0.5} />

			<Grid container spacing={2}>
				{informacoesAdicionais.map((ia, index) => (
					<Grid key={index} item xs={2}>
						<LabelValue
							label={ia.label}
							direction={ia.direction || "row"}
							xsLabel={ia.xsLabel || 6}
							xsValue={ia.xsValue || 6}>
							{ia.valor instanceof Array
								? (
									<Grid container justify="space-around">
										{(ia.valor || []).map((v, index) => (
											<React.Fragment key={index}>
												{index > 0 ? <Divider orientation="vertical" flexItem /> : null}
												<Typography component="span" align={ia.valueAlign || "right"}>
													{v}
												</Typography>
											</React.Fragment>
										))}
									</Grid>
								)
								: <Typography component="span" align={ia.valueAlign || "left"}>{ia.valor}</Typography>}
						</LabelValue>
					</Grid>
				))}
			</Grid>
		</React.Fragment>
	);
}

export default TabUnidade;