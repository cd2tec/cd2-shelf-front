import React, { useCallback, useEffect, useState } from 'react';
import {
	makeStyles, colors, Divider, CardHeader, TableContainer, IconButton,
	TableRow, TableCell, Tooltip
} from '@material-ui/core';
import { RemoveCircle as RemoveIcon, AddCircle as AddIcon } from '@material-ui/icons';

import alerts from '../../../utils/alerts';
import { TableSort, TableSortColumn } from '../../../components/material';
import { numberFormat, DECIMAIS } from '../../../utils/formats/number';

import { defaultProcessCatch, AcaoVendaAPI, FluxoAPI, filterErrors, Errors } from '../../../services/api';
import SelecaoProdutoCombateDialog from './SelecaoProdutoCombateDialog';
import EdicaoPrecoField from '../../produtos/EdicaoPrecoDialog/EdicaoPrecoField';

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

const ListaProdutosCombate = ({
	fluxo,
	errors, setErrors,
	acao,
	produtosCombate,
	setProdutosCombate,
	disabled,
}) => {
	const classes = useStyles();
	const [dialog, setDialog] = useState();
	const [produtos, setProdutos] = useState([]);
	const [unidades, setUnidades] = useState([]);
	const [projecaoLucro, setProjecaoLucro] = useState({});
	const [projecaoLucroAcao, setProjecaoLucroAcao] = useState({});

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
		FluxoAPI.calcularProjecaoLucro(acao.fluxo.uuid, {})
			.then(rs => setProjecaoLucroAcao((rs.produtos || []).reduce((previous, current) => ({
				...previous,
				[`${current.produto_uuid}_${current.unidade_uuid}`]: current,
			}), {})))
			.catch(defaultProcessCatch());
	}, [acao]);

	useEffect(() => {
		let errors = new Errors();
		for (const pc of produtosCombate) {
			for (const u of pc.unidades || []) {
				const key = `${pc.uuid}_${u.unidade.uuid}`;
				const pl = projecaoLucro[key];

				const keyOriginal = `${pc.original.produto.uuid}_${u.unidade.uuid}`;
				const plOriginal = projecaoLucroAcao[keyOriginal];

				if (!pl || !plOriginal) continue;

				const margem = pl.margem || 0;
				const margemOriginal = plOriginal.margem || 0;

				const fieldName = `produtos[${key}].margem_acao`;
				if (margem < margemOriginal) {
					errors.addFieldViolation(fieldName, 'Margem de combate inferior à margem da ação');
				}
			}
		}
		setErrors(errors);
	}, [setErrors, produtosCombate, projecaoLucro, projecaoLucroAcao]);

	useEffect(() => {
		AcaoVendaAPI.getAcaoVenda(acao.uuid)
			.then(rs => {
				setProdutos(rs.produtos || []);
				setUnidades(rs.unidades || []);
			})
			.catch(defaultProcessCatch());
	}, [acao.uuid]);

	const selecionarProdutoCombate = original => setDialog(
		<SelecaoProdutoCombateDialog
			produto={original.produto}
			onClose={combate => {
				if (combate) {
					if (produtosCombate.filter(pc => pc.uuid === combate.uuid).length) {
						alerts.snackbars.warning('Produto já incluso');
					} else {
						setProdutosCombate([
							...produtosCombate,
							{ ...combate, original }]);
					}
				}

				setDialog(null);
			}} />
	)

	const removerProduto = produto => {
		alerts.confirmYesNo(
			'Remover produto',
			`Remover ${produto.descricao}?`,
			{
				onYes: () => setProdutosCombate(produtosCombate.filter(p => p.uuid !== produto.uuid)),
			});
	}

	const getRows = () => {
		const unidadesSelecionadas = unidades.map(u => u.uuid);

		let rows = [];
		for (const { unidades, curvas, ...produto } of produtosCombate) {
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
			<CardHeader title={`Produtos (${produtosCombate.length} selecionados)`} />
			<Divider />

			<TableContainer>
				<TableSort
					size="small"
					rows={getRows()}
					groups={produtos.map(p => ({
						valor: p.produto.uuid,
						descricao: p.produto.descricao,
						produto: p,
					}))}
					groupBy="original.produto.uuid"
					renderGroup={(g, { rowsGroup, rowClassName, colsCount }) => {
						const unidades = g.produto.produto.unidades || [];
						const produtoUnidade = unidades.length ? unidades[0] : {};
						const pl = projecaoLucroAcao[`${g.produto.produto.uuid}_${produtoUnidade.unidade.uuid}`] || {};

						return (
							<React.Fragment>
								<TableRow hover className={rowClassName}>
									<TableCell align="center" padding="none">
										<Tooltip title="Adicionar Combate">
											<IconButton disabled={disabled} color="primary" onClick={() => selecionarProdutoCombate(g.produto)}>
												<AddIcon />
											</IconButton>
										</Tooltip>
									</TableCell>
									<TableCell>{g.produto.produto.codigo}</TableCell>
									<TableCell>{g.descricao}</TableCell>
									<TableCell>R$ {numberFormat(produtoUnidade.preco_compra, DECIMAIS.VALOR)}</TableCell>
									<TableCell>R$ {numberFormat(produtoUnidade.preco_atual, DECIMAIS.VALOR)}</TableCell>
									<TableCell>R$ {numberFormat(produtoUnidade.custo_total, DECIMAIS.VALOR)}</TableCell>
									<TableCell>R$ {numberFormat(produtoUnidade.custo_medio, DECIMAIS.VALOR)}</TableCell>
									<TableCell>{numberFormat(produtoUnidade.margem, DECIMAIS.PERCENTUAL)}%</TableCell>
									<TableCell>{numberFormat(produtoUnidade.margem_minima, DECIMAIS.PERCENTUAL)}%</TableCell>
									<TableCell>R$ {numberFormat(pl.preco, DECIMAIS.VALOR)}</TableCell>
									<TableCell>{numberFormat(pl.margem, DECIMAIS.PERCENTUAL)}%</TableCell>
									<TableCell>R$ {numberFormat(pl.lucro, DECIMAIS.VALOR)}</TableCell>
									<TableCell>R$ {numberFormat(produtoUnidade.lucro_atual, DECIMAIS.VALOR)}</TableCell>
								</TableRow>

								{rowsGroup.length
									? rowsGroup
									: (
										<TableRow hover>
											<TableCell colSpan={colsCount} align="center" style={{ fontWeight: 500 }}>
												- Nenhum produto combate adicionado -
											</TableCell>
										</TableRow>
									)}
							</React.Fragment>
						);
					}}>

					<TableSortColumn width={50} padding="none" align="center"
						formatter={(_, p) => (
							<Tooltip title="Remover Produto">
								<IconButton disabled={disabled} color="secondary" onClick={() => removerProduto(p)}>
									<RemoveIcon />
								</IconButton>
							</Tooltip>
						)} />

					<TableSortColumn field="codigo" title="Código" width={120} />

					<TableSortColumn field="descricao" title="Descrição"
						classHead={classes.stickyColumn} classBody={classes.stickyColumn} width={210} />

					{unidades.length > 1 ? (
						<TableSortColumn field="unidade.unidade.codigo" title="Unidade" width={120} />
					) : null}

					<TableSortColumn field="unidade.preco_compra" title="Preço Compra" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

					<TableSortColumn field="unidade.preco_atual" title="Preço Venda" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

					<TableSortColumn field="unidade.custo_total" title="Custo Total" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

					<TableSortColumn field="unidade.custo_medio" title="Custo Médio" width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

					<TableSortColumn field="unidade.margem" title="Margem Atual" width={110}
						formatter={v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`} />

					<TableSortColumn field="unidade.margem_minima" title="Margem Mínima" width={110}
						formatter={v => `${numberFormat(v, DECIMAIS.PERCENTUAL)}%`} />

					<TableSortColumn field="unidade.preco_acao" title="Preço Ação" width={190}
						classHead={classes.stickyColumn} classBody={classes.stickyColumn}
						formatter={(_, p) => {
							if (fluxo) {
								const fieldName = `produtos[${p.uuid}_${p.unidade.unidade.uuid}].margem_acao`;
								return (
									<EdicaoPrecoField
										produtoUUID={p.uuid}
										unidadeUUID={p.unidade.unidade.uuid}
										fluxoUUID={fluxo.uuid}
										onChange={() => recalcularProjecaoLucro()}
										errorText={filterErrors(errors, fieldName)}
										showOferta />
								);
							}

							return 'Cadastre para iniciar precificação';
						}} />

					<TableSortColumn
						field="margem_acao"
						title="Margem Ação"
						width={110}
						formatter={(_, p) => {
							const pl = projecaoLucro[`${p.uuid}_${p.unidade.unidade.uuid}`];
							if (pl && pl.margem) {
								return `${numberFormat(pl.margem, DECIMAIS.MARGEM_LUCRO)}%`;
							}
							return '-';
						}} />

					<TableSortColumn
						field="lucro_acao"
						title="Lucro Ação"
						width={110}
						formatter={(_, p) => {
							const pl = projecaoLucro[`${p.uuid}_${p.unidade.unidade.uuid}`];
							if (pl && pl.lucro) {
								return `R$ ${numberFormat(pl.lucro, DECIMAIS.VALOR)}`;
							}
							return '-';
						}} />

					<TableSortColumn
						field="unidade.lucro_atual"
						title="Lucro Atual"
						width={110}
						formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />
				</TableSort>
			</TableContainer>

			{dialog}
		</React.Fragment >
	);
}

export default ListaProdutosCombate;