import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

import {
	Dialog, DialogTitle, DialogActions, DialogContent, Button,
	Table, TableHead, TableBody, TableRow, TableCell, Grid,
	makeStyles, Typography, colors,
} from '@material-ui/core';
import {
	ThumbUp as ThumbUpIcon,
	ThumbDown as ThumbDownIcon,
} from '@material-ui/icons';


import { numberFormat, DECIMAIS } from '../../../utils/formats';
import { defaultProcessCatch, FluxoAPI, fluxoOrigemText, FluxoStatus } from '../../../services/api';
import { TextField } from '../../../components/material';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import alerts from '../../../utils/alerts';
import EdicaoPrecoField from '../../produtos/EdicaoPrecoDialog/EdicaoPrecoField';
import { showLoading } from '../../../utils/loading';

const useStyles = makeStyles(() => ({
	rowProduto: {
		'& > tr > td': {
			cursor: 'pointer',
		},
	},
	colFocus: {
		backgroundColor: colors.grey[200],
	},
	thumbUp: {
		color: `${colors.green[500]} !important`,
		backgroundColor: `${colors.green[100]} !important`,
	},
	thumbDown: {
		color: `${colors.red[500]} !important`,
		backgroundColor: `${colors.red[100]} !important`,
	},
}));

const DetalhamentoProduto = ({ detalhamento }) => {
	const { produto_unidade } = detalhamento;
	const { produto } = produto_unidade;

	return (
		<div style={{ padding: 8, borderBottom: '1px solid #ccc' }}>
			<Grid container spacing={2}>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Código"
						value={produto.codigo} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Descrição"
						value={produto.descricao} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Código de Barra"
						value={produto.codigo_barra} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Marca"
						value={produto.marca} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Complemento"
						value={produto.complemento} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Custo Compra"
						value={numberFormat(produto_unidade.custo_compra, DECIMAIS.VALOR)} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Custo Total"
						value={numberFormat(produto_unidade.custo_total, DECIMAIS.VALOR)} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Custo Médio"
						value={numberFormat(produto_unidade.custo_medio, DECIMAIS.VALOR)} />
				</Grid>
				<Grid item>
					<TextField
						disabled={true}
						size="small"
						label="Lucro Unitário"
						value={numberFormat(produto_unidade.lucro_atual, DECIMAIS.VALOR)} />
				</Grid>
			</Grid>
		</div>
	);
}

const ProdutosDialog = ({ fluxo, onClose }) => {
	const classes = useStyles();
	const [loading, setLoading] = useState(true);
	const [produtos, setProdutos] = useState([]);
	const [mesesVendas, setMesesVendas] = useState([]);
	const [detalhamento, setDetalhamento] = useState(null);
	const [validade, setValidade] = useState({inicio: "", fim: ""})

	const getValidade = (produtos) => {
		const validade = {inicio: "", fim: ""}
		FluxoAPI.getProdutoFluxo(fluxo.uuid, produtos[0]?.produto_unidade.produto.uuid)
			.finally(() => setLoading(false))
			.then(rs => {
				// eslint-disable-next-line
				const filtered = rs.unidades.filter(u => {
					if (u.produto.oferta.periodo.inicio) {
						return u
					}
				})
				validade.inicio = correctDate(filtered[0].produto.oferta.periodo.inicio)
				validade.fim = correctDate(filtered[0].produto.oferta.periodo.fim)
				setValidade(validade)
			})
			.catch(defaultProcessCatch());
	}

	const reloadProdutos = useCallback(() => {
		setLoading(true);
		showLoading('Carregando produtos...',
			FluxoAPI.listProdutosFluxo(fluxo.uuid)
				.finally(() => setLoading(false))
				.then(rs => {
					setProdutos(rs.produtos || []);
					setMesesVendas(rs.meses_vendas || []);
					return rs.produtos
				})
				.then(produtos => {
					getValidade(produtos)
					fetchOfertaDetails(produtos)
				})
				.catch(defaultProcessCatch()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fluxo.uuid]);

	useEffect(() => {
		reloadProdutos();
	}, [reloadProdutos]);

	const handleRowProduto = produto => {
		setDetalhamento(
			!detalhamento
				|| detalhamento.produto_unidade.produto.uuid !== produto.produto_unidade.produto.uuid
				|| detalhamento.produto_unidade.unidade.uuid !== produto.produto_unidade.unidade.uuid
				? produto : null
		);
	}

	const handleToggleAll = (_, action) => {
		if (action !== 'aprovar-todos' && action !== 'negar-todos') return;

		FluxoAPI.alterarStatusProdutos(
			fluxo.uuid,
			{
				produtos: produtos.map(p => ({
					produto_uuid: p.produto_unidade.produto.uuid,
					unidade_uuid: p.produto_unidade.unidade.uuid,
				})),
				status: action === 'aprovar-todos' ? FluxoStatus.APROVADO : FluxoStatus.RECUSADO,
			})
			.then(() => {
				console.log('alterado!');
				reloadProdutos();
			})
			.catch(defaultProcessCatch());
	}

	const handleToggleProduto = ({ produto_unidade }) => (_, action) => {
		if (action !== 'aprovar' && action !== 'negar') return;

		FluxoAPI.alterarStatusProdutos(
			fluxo.uuid,
			{
				produtos: [{
					produto_uuid: produto_unidade.produto.uuid,
					unidade_uuid: produto_unidade.unidade.uuid,
				}],
				status: action === 'aprovar' ? FluxoStatus.APROVADO : FluxoStatus.RECUSADO,
			})
			.then(() => {
				reloadProdutos();
			})
			.catch(defaultProcessCatch());
	}

	const handleAprovar = () => {
		alerts.confirmYesNo(
			'Aprovar alteração de preços',
			'Tem certeza de que deseja aprovar as alterações dos produtos marcados como "aprovados"?',
			{
				onYes: () => {
					FluxoAPI.autorizarFluxo(fluxo.uuid, {})
						.then(() => {
							alerts.snackbars.success('Alterações aprovadas');
							onClose(true);
						})
						.catch(defaultProcessCatch());
				},
			});
	}

	const handleNegar = () => {
		alerts.confirmYesNo(
			'Negar alteração de preços',
			'Tem certeza de que deseja negar a alteração de preço de todos os produtos?',
			{
				onYes: () => {
					FluxoAPI.negarFluxo(fluxo.uuid, {})
						.then(() => {
							alerts.snackbars.info('Alterações negadas');
							onClose(true);
						})
						.catch(defaultProcessCatch());
				},
			});
	}

	const correctDate = date => {
		const [year, mm, dd] = date.split("-")
		return `${dd}/${mm}/${year}`
	}


	const [projecaoLucro, setProjecaoLucro] = useState({});
	const fetchOfertaDetails = () => {
		FluxoAPI.calcularProjecaoLucro(fluxo.uuid, {})
		.then(rs => setProjecaoLucro((rs.produtos || []).reduce((previous, current) => ({
			...previous,
			[`${current.produto_uuid}_${current.unidade_uuid}`]: current,
		}), {})))
		.catch(defaultProcessCatch())
	}

	return (
		<Dialog open={true} fullScreen>
			<DialogTitle>
				Edição de Produtos: {fluxo.nome}
				<br />
				<Typography>
					Tipo: {fluxoOrigemText(fluxo.origem)} | Validade: {validade.inicio ? `${validade.inicio} - ${validade.fim}` : 'nao ativo'}
				</Typography>
				{fluxo.acao_venda
					? (
						<Typography>
							Período da Ação:{' '}
							{moment(fluxo.acao_venda.validade_inicio, 'YYYY-MM-DD').format('DD/MM/YYYY')}
							{' até '}
							{moment(fluxo.acao_venda.validade_fim, 'YYYY-MM-DD').format('DD/MM/YYYY')}
						</Typography>
					) : null}
			</DialogTitle>

			<DialogContent style={{ padding: 0 }} dividers>
				<Table style={{ zoom: '90%' }} size="small" >
					<TableHead>
						<TableRow>
							<TableCell colSpan={8}></TableCell>

							{/* {fluxo.origem === FluxoOrigem.PESQUISA
								? <TableCell className={classes.colFocus} align="center">Pesquisa</TableCell>
								: fluxo.origem === FluxoOrigem.ACAOVENDA
									? <TableCell className={classes.colFocus} align="left">Ação de Vendas</TableCell>
									: null} */}

							<TableCell></TableCell>
							<TableCell align="center" colSpan={mesesVendas.length + 3}>Quantidade Vendas</TableCell>
							<TableCell align="center"></TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Unidade</TableCell>
							<TableCell>Produto</TableCell>
							<TableCell align="right" style={{ width: 100 }}>Custo Total</TableCell>
							<TableCell style={{ width: 120 }}>Preço de Venda</TableCell>
							<TableCell style={{ width: 120 }}>Preço Oferta</TableCell>
							<TableCell>Lucro Oferta</TableCell>
							<TableCell align='right' >% Margem Oferta</TableCell>
							<TableCell align="right" style={{ width: 110 }}>% Margem Mínima</TableCell>
							<TableCell align="right" style={{ width: 110 }}>% Margem Ideal</TableCell>
							<TableCell align="right" style={{ width: 110 }}>% Margem Atual</TableCell>
							<TableCell align="right" style={{ width: 100 }}>Preço Sugerido</TableCell>

							{/* {fluxo.origem === FluxoOrigem.PESQUISA
								? <TableCell align="right" className={classes.colFocus} style={{ width: 100 }}>Pr. Menor Concorrência</TableCell>
								: fluxo.origem === FluxoOrigem.ACAOVENDA
									? <TableCell align="right" className={classes.colFocus} style={{ width: 100 }}>Oferta</TableCell>
									: null} */}

							<TableCell align="right" style={{ width: 100 }}>Estoque Atual</TableCell>
							{mesesVendas.map((mes, index) => (
								<TableCell key={index} align="right" style={{ width: 100 }}>
									{moment(mes, 'YYYY-MM-DD').format('MM/YYYY')}
								</TableCell>
							))}
							<TableCell align="right" style={{ width: 100 }}>Média Diária</TableCell>
							<TableCell padding="none" align="center" style={{ width: 100 }}>
								<ToggleButtonGroup size="small" exclusive onChange={handleToggleAll}>
									<ToggleButton value="negar-todos">
										<ThumbDownIcon />
									</ToggleButton>
									<ToggleButton value="aprovar-todos">
										<ThumbUpIcon />
									</ToggleButton>
								</ToggleButtonGroup>
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody className={classes.rowProduto}>
						{!loading && !produtos.length ? (
							<TableRow>
								<TableCell align="center" colSpan={mesesVendas.length + 11}>
									- Nenhuma alteração de preço realizada -
								</TableCell>
							</TableRow>
						) : null}

						{produtos.map((p, index) => (
							<TableRow key={index} hover
								selected={
									detalhamento
										? detalhamento.produto_unidade.produto.uuid === p.produto_unidade.produto.uuid &&
										detalhamento.produto_unidade.unidade.uuid === p.produto_unidade.unidade.uuid
										: false
								}
								onClick={() => handleRowProduto(p)}>
								<TableCell>{p.produto_unidade.unidade.codigo}</TableCell>
								<TableCell>{p.produto_unidade.produto.codigo} - {p.produto_unidade.produto.descricao}</TableCell>

								<TableCell align="right">
									R$ {numberFormat(p.produto_unidade.custo_total, DECIMAIS.VALOR)}
								</TableCell>

								<TableCell padding="none">
									<EdicaoPrecoField
										fluxoUUID={fluxo.uuid}
										produtoUUID={p.produto_unidade.produto.uuid}
										unidadeUUID={p.produto_unidade.unidade.uuid}
										onChange={() => reloadProdutos()} />
								</TableCell>
								<TableCell>{
									projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`]?.preco
										? `R$ ${numberFormat(projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`].preco, DECIMAIS.VALOR)}`
										: 0
									}</TableCell>
								<TableCell>{
									projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`]?.lucro ?
									`R$ ${numberFormat(projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`].lucro, DECIMAIS.VALOR)}`
									: 0
								}
								</TableCell>
								<TableCell>{
								projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`]?.margem ?
								`${numberFormat(projecaoLucro[`${p.produto_unidade.produto.uuid}_${p.produto_unidade.unidade.uuid}`].margem, DECIMAIS.PERCENTUAL)}%`
								: 0
								}
								</TableCell>

								<TableCell align="right">{numberFormat(p.produto_unidade.margem_minima, DECIMAIS.PERCENTUAL)}%</TableCell>
								<TableCell align="right">{numberFormat(p.produto_unidade.margem, DECIMAIS.PERCENTUAL)}%</TableCell>
								<TableCell align="right">{numberFormat(p.produto_unidade.margem_atual, DECIMAIS.PERCENTUAL)}%</TableCell>
								<TableCell align="right">R$ {numberFormat(p.produto_unidade.preco_sugerido, DECIMAIS.VALOR)}</TableCell>

								<TableCell align="right">{numberFormat(p.produto_unidade.estoque, DECIMAIS.QUANTIDADES)}</TableCell>
								{mesesVendas.map((m, index) => (
									<TableCell align="right" key={index}>
										{numberFormat(p.produto_unidade.stats.vendas_trimestre[index].valor, DECIMAIS.QUANTIDADES)}
									</TableCell>
								))}
								<TableCell align="right">
									{numberFormat(p.produto_unidade.stats.venda_media_diaria, DECIMAIS.QUANTIDADES)}
								</TableCell>
								<TableCell align="center" padding="none">
									<ToggleButtonGroup
										size="small" exclusive
										onChange={handleToggleProduto(p)}
										value={
											p.status === FluxoStatus.APROVADO
												? 'aprovar'
												: p.status === FluxoStatus.RECUSADO
													? 'negar'
													: undefined
										}>
										<ToggleButton classes={{ selected: classes.thumbDown }} value="negar">
											<ThumbDownIcon />
										</ToggleButton>
										<ToggleButton classes={{ selected: classes.thumbUp }} value="aprovar">
											<ThumbUpIcon />
										</ToggleButton>
									</ToggleButtonGroup>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>

			{detalhamento ? <DetalhamentoProduto detalhamento={detalhamento} /> : null}

			<DialogActions>
				<Button color="secondary" onClick={handleNegar}>Negar</Button>
				<Button color="primary" onClick={handleAprovar}>Aprovar</Button>
				<Button onClick={() => onClose()}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ProdutosDialog;