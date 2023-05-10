import React, { useCallback, useEffect, useState } from 'react';
import {
	makeStyles, colors, Divider, CardHeader, Button, TableContainer, IconButton, Tooltip,
	InputAdornment
} from '@material-ui/core';
import { RemoveCircle as RemoveIcon, MonetizationOn as MonetizationIcon } from '@material-ui/icons';

import alerts from '../../../utils/alerts';
import { TableSort, TableSortColumn } from '../../../components/material';
import { numberFormat, DECIMAIS } from '../../../utils/formats';

import { AcaoVendaModelo, defaultProcessCatch, FluxoAPI, filterErrors, Errors } from '../../../services/api';
import EdicaoPrecoField from '../../produtos/EdicaoPrecoDialog/EdicaoPrecoField';
import CustomTextField from "./CustomTextField";

const useStyles = makeStyles(() => ({
	stickyColumn: {
		position: 'sticky',
		background: '#eee',
		left: 0,
		zIndex: 1,
	},
	rowGroupCurva: {
		'& > td': {
			fontWeight: 600,
			paddingLeft: 32,
		},
		backgroundColor: colors.grey[200],
	},
}));

const ListaProdutos = ({
	fluxo,
	modelo,
	errors,
	setErrors,
	disabled,
	handleSelecaoProdutos,
	handleInicializarProdutos,
	handleInicializarPrecos,
	handleSugestaoPrecoMargem,
 	setRowsCopy,
	curvas,
	produtos,
	unidades = [],
	status,
	onChangeProdutos,
	limparProdutos,
}) => {
	const classes = useStyles();
	const [projecaoLucro, setProjecaoLucro] = useState({});
	const [precoVenda, setPrecoVenda] = useState(0);
	let [count, setCount] = useState(0)

	const recalcularProjecaoLucro = useCallback(() => {
		if (!fluxo) return;
		FluxoAPI.calcularProjecaoLucro(fluxo.uuid, {})
			.then(rs => setProjecaoLucro((rs.produtos || []).reduce((previous, current) => ({
				...previous,
				[`${current.produto_uuid}_${current.unidade_uuid}`]: current,
			}), {})))
			.catch(defaultProcessCatch());
	}, [fluxo]);

	useEffect(() => {
		recalcularProjecaoLucro();
	}, [recalcularProjecaoLucro]);

	useEffect(() => {
		if (modelo !== AcaoVendaModelo.RECUPERACAO) return;

		let errors = new Errors();
		for (const p of produtos) {
			for (const u of p.unidades || []) {
				const key = `${p.uuid}_${u.unidade.uuid}`;
				const pl = projecaoLucro[key];

				if (!pl) continue;

				const margem = pl.margem || 0;
				const fieldName = `produtos[${key}].margem_acao`;
				if (margem < u.margem_minima) {
					errors.addFieldViolation(fieldName, 'Margem inferior à margem mínima do produto');
				}
			}
		}
		setErrors(errors);
	}, [modelo, setErrors, produtos, projecaoLucro]);

	const removerProduto = produto => {
		alerts.confirmYesNo(
			'Remover produto',
			`Remover ${produto.descricao}?`,
			{
				onYes: () => onChangeProdutos(produtos.filter(p => p.uuid !== produto.uuid)),
			});
	}

	let grupos = [];
	for (let c of curvas) {
		let qtdProdutos = produtos.filter(p => p.curvas.venda === c.letra).length;
		if (qtdProdutos) {
			grupos.push({
				valor: c.letra,
				descricao: `Curva ${c.letra} (${qtdProdutos} produto(s))`
			});
		}
	}

	const produtosSemCurva = produtos.filter(p => !p.curvas.venda || p.curvas.venda === '-');
	if (produtosSemCurva.length) {
		grupos.push({
			valor: '-',
			descricao: `Sem Curva (${produtosSemCurva.length} produto(s))`
		});
	}

	const getRows = () => {
		const unidadesSelecionadas = (unidades || []).map(u => u.uuid);

		let rows = [];
		for (const { unidades, curvas, ...produto } of produtos) {
			for (const unidade of (unidades || [])) {
				if (unidadesSelecionadas.indexOf(unidade.unidade.uuid) < 0) {
					continue;
				}

				rows.push({
					...produto,
					unidade,
					curvas: {
						venda: curvas.venda ? curvas.venda : '-',
					},
				});
			}
		}
		return rows;
	}

	return (
		<React.Fragment>
			<Divider />
			<CardHeader title={`Produtos (${produtos.length} selecionados)`} />
			<Divider />
			<div style={{ padding: '20px 10px', display: 'flex' }}>
				<Button
					disabled={disabled || status === 'FINALIZADA'}
					variant="outlined"
					color="primary"
					onClick={handleInicializarProdutos}
					style={{ marginLeft: 8 }}>
					Inicializar Produtos
				</Button>

				{modelo === AcaoVendaModelo.ACAO ? (
					<Button
						disabled={disabled || status === 'FINALIZADA'}
						variant="outlined"
						color="secondary"
						onClick={handleInicializarPrecos}
						style={{ marginLeft: 8 }}>
						Inicializar Preços
					</Button>
				) : null}

				<Button
					disabled={disabled || status === 'FINALIZADA'}
					color="secondary"
					onClick={handleSelecaoProdutos}
					style={{ marginLeft: 8 }}>
					Pesquisar Produto
				</Button>

				<Button
					disabled={disabled || !produtos.length || status === 'FINALIZADA'}
					color="secondary"
					onClick={limparProdutos}
					style={{ marginLeft: 'auto' }}>
					Remover produtos
				</Button>
			</div>
			<Divider />

			<TableContainer>
				<TableSort
					size="small"
					rows={getRows()}
					groups={grupos}
					groupBy="curvas.venda">
					<TableSortColumn width={30} padding="none" align="center"
						formatter={(_, p) => (
							<IconButton disabled={disabled || status === 'FINALIZADA'} color="secondary" onClick={() => removerProduto(p)}>
								<RemoveIcon />
							</IconButton>
						)}
					/>
					<TableSortColumn field="codigo" title="Código" width={120} />
					<TableSortColumn field="descricao" title="Descrição" classHead={classes.stickyColumn}
						classBody={classes.stickyColumn} width={210} />

					{unidades.length > 1 ? (
						<TableSortColumn field="unidade.unidade.codigo" title="Unidade" width={120} />
					) : null}

					<TableSortColumn field="unidade.preco_compra" title="Preço Compra" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn field="unidade.preco_atual" title="Preço Venda" width={200}
						formatter={(v, b) => {
							let disabled = true
							if (fluxo) { disabled = false }

							if (count === 0 && precoVenda === 0) {
								setPrecoVenda(v)
								setCount(1)
							}
							let errText = ""
							if (v < 0 ) {
								errText = "valor inválido"
							}
							let local = b.unidade

							return (
								<CustomTextField
									disabled={disabled || status === 'FINALIZADA'}
									errorText={errText}
									value={local.preco_atual}
									onChange={(v) => local.preco_atual = v}
									onInternalValueChange={(value) => setRowsCopy(value,v,b)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												R$
											</InputAdornment>
										),
									}}
								/>
							);
						}}
					/>
					<TableSortColumn field="unidade.custo_total" title="Custo Total" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn field="unidade.custo_medio" title="Custo Médio" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`}
					/>
					<TableSortColumn field="unidade.margem_atual" title="Margem Atual" width={50}
						formatter={v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`}
					/>
					<TableSortColumn field="unidade.margem_minima"  title="Margem Mínima" width={50}
						formatter={v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`}
					/>
					<TableSortColumn field="preco_acao" title="Preço Ação" classHead={classes.stickyColumn}
						classBody={classes.stickyColumn} width={250}
						formatter={(_, p) => {
							if (fluxo) {
								const fieldName = `produtos[${p.uuid}_${p.unidade.unidade.uuid}].margem_acao`;
								return (
									<EdicaoPrecoField
										disabled={status === 'FINALIZADA'}
										produtoUUID={p.uuid}
										unidadeUUID={p.unidade.unidade.uuid}
										fluxoUUID={fluxo.uuid}
										onChange={() => recalcularProjecaoLucro()}
										customLeftEndIcon={setValue => (
											<IconButton onClick={() => handleSugestaoPrecoMargem(p, setValue)} style={{ padding: -5 }}>
												<Tooltip title="Inicilizar Preço" position="to" placement="top">
													<MonetizationIcon />
												</Tooltip>
											</IconButton>
										)}
										errorText={filterErrors(errors, fieldName)}
										showOferta />
								);
							}

							return 'Cadastre para iniciar precificação';
						}}

					/>
					<TableSortColumn field="margem_acao" title="Margem Ação" width={110}
						formatter={(_, p) => {
							const pl = projecaoLucro[`${p.uuid}_${p.unidade.unidade.uuid}`];
							if (pl && pl.margem) {
								return `${numberFormat(pl.margem, DECIMAIS.MARGEM_LUCRO)}%`;
							}
							return '-';
						}}
					/>
					<TableSortColumn field="lucro_acao" title="Lucro Ação" width={110}
						formatter={(_, p) => {
							const pl = projecaoLucro[`${p.uuid}_${p.unidade.unidade.uuid}`];
							if (pl && pl.lucro) {
								return `R$ ${numberFormat(pl.lucro, DECIMAIS.VALOR)}`;
							}
							return '-';
						}}
					/>
					<TableSortColumn field="unidade.lucro_atual" title="Lucro Atual" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`}
					/>
				</TableSort>
			</TableContainer>

		</React.Fragment>
	);
}

export default ListaProdutos;
