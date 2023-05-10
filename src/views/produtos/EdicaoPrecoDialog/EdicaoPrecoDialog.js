import React, { useCallback, useEffect, useState } from 'react';

import {
	Button, Dialog, DialogActions, DialogContent, DialogTitle,
	Divider, Grid, Typography, Box, Tabs, Tab, InputAdornment,
} from '@material-ui/core';
import { Check as CheckIcon } from '@material-ui/icons';

import alerts from '../../../utils/alerts';
import { Checkbox, DateRangePicker, NumberField, TableSort, TableSortColumn } from '../../../components/material';
import { DECIMAIS, numberFormat } from '../../../utils/formats';

import LabelValue from './LabelValue';
import TabUnidade from './TabUnidade';
import TabAlteracoes from './TabAlteracoes';
import CustomTextField from '../../pricing/competitividade/View/CustomTextField';
import { defaultProcessCatch, FluxoAPI, ProdutoAPI, FluxoOrigem } from '../../../services/api';
import Calculadora from '../calculadora';
import TabHistorico from './TabHistorico';

const tabs = {
	unidade: 'unidade',
	alteracoes: 'alteracoes',
	historico: 'historico',
};

const EdicaoPrecoDialog = ({ produtoUUID, fluxoUUID, unidadeUUID, fluxoOrigem, closeOnSave, onClose }) => {
	const [produto, setProduto] = useState();
	const [produtoUnidade, setProdutoUnidade] = useState();
	const [fluxo, setFluxo] = useState();
	const [unidade, setUnidade] = useState();
	const [atualizacoes, setAtualizacoes] = useState({});
	const [loadingCurvas, setLoadingCurvas] = useState(true);
	const [curvas, setCurvas] = useState({
		geral: {},
		unidades: {},
	});
	const [stats, setStats] = useState({});

	const [hasChanges, setHasChanges] = useState(false);
	const [dialog, setDialog] = useState();
	const [activeTab, setActiveTab] = useState(tabs.unidade);

	useEffect(() => {
		setLoadingCurvas(true);
		ProdutoAPI.calcularCurva(produtoUUID, {})
			.finally(() => setLoadingCurvas(false))
			.then(rs => setCurvas(rs))
			.catch(defaultProcessCatch());
	}, [produtoUUID]);

	useEffect(() => {
		ProdutoAPI.getProdutoStats(produtoUUID)
			.then(rs => setStats(rs.stats || {}))
			.catch(defaultProcessCatch());
	}, [produtoUUID]);

	useEffect(() => {
		setDialog(null);

		ProdutoAPI.get(produtoUUID)
			.then(rs => {
				setProduto(rs);

				let unidades = unidadeUUID
					? (rs.unidades || []).filter(u => u.unidade.uuid === unidadeUUID)
					: (rs.unidades || []);
				if (unidades.length) {
					setUnidade(unidades[0].unidade);
				}
			})
			.catch(defaultProcessCatch());
	}, [produtoUUID, unidadeUUID]);

	useEffect(() => {
		if (!fluxoUUID) return;

		FluxoAPI.getFluxo(fluxoUUID)
			.then(rs => setFluxo(rs))
			.catch(defaultProcessCatch());
	}, [fluxoUUID]);

	useEffect(() => {
		if (!unidade || !produto || !produto.unidades) return;

		for (const pu of (produto.unidades || [])) {
			if (pu.unidade.uuid === unidade.uuid) {
				setProdutoUnidade(pu);
				break;
			}
		}
	}, [produto, unidade]);

	const openCalculadora = () => setDialog(
		<Calculadora produto={{...produto, unidades: [produtoUnidade]}} onClose={() => setDialog(null)} />
	)

	const reloadPrecos = useCallback(() => {
		setHasChanges(false);
		FluxoAPI.getProdutoFluxo(fluxoUUID ? fluxoUUID : '-', produtoUUID, fluxoUUID ? undefined : fluxoOrigem || undefined)
			.then(rs => {
				setAtualizacoes((rs.unidades || []).reduce((unidades, u) => {
					const { produto, pode_alterar, has_alteracoes } = u;
					return {
						...unidades,
						[u.unidade.uuid]: {
							alterado: false,

							pode_alterar,
							has_alteracoes,
							unidade: u.unidade,

							ativo: produto.ativo,
							bloqueado: produto.bloqueado,
							oferta_ativo: produto.oferta.ativo,
							oferta_valor: produto.oferta.ativo ? produto.oferta.valor : 0,
							oferta_inicio: produto.oferta.periodo.inicio,
							oferta_fim: produto.oferta.periodo.fim,

							preco1_valor: produto.preco1.valor,
							preco1_margem: produto.preco1.margem,
							preco1_margem_minima: produto.preco1.margem_minima,
							preco1_fator: produto.preco1.fator,
							preco2_valor: produto.preco2.valor,
							preco2_margem: produto.preco2.margem,
							preco2_fator: produto.preco2.fator,
							preco3_valor: produto.preco3.valor,
							preco3_margem: produto.preco3.margem,
							preco3_fator: produto.preco3.fator,
							preco4_valor: produto.preco4.valor,
							preco4_margem: produto.preco4.margem,
							preco4_fator: produto.preco4.fator,
							preco5_valor: produto.preco5.valor,
							preco5_margem: produto.preco5.margem,
							preco5_fator: produto.preco5.fator,
						},
					};
				}, {}));
			})
			.catch(defaultProcessCatch());
	}, [fluxoUUID, fluxoOrigem, produtoUUID]);

	useEffect(() => {
		if (!produtoUUID || (fluxoUUID && !fluxo)) return;
		reloadPrecos();
	}, [reloadPrecos, produtoUUID, fluxoUUID, fluxoOrigem, fluxo]);

	if (!produto || !unidade || !Object.values(atualizacoes).length) return null;
	if (fluxoUUID && !fluxo) return null;

	const handleClose = () => {
		if (hasChanges) {
			alerts.confirmYesNo('Alteração de Preços', 'Existem alterações não salvas, deseja sair mesmo assim?', {
				onYes: () => onClose(),
			});
			return;
		}

		onClose();
	}

	const handleSubmit = () => {
		if (!hasChanges) return;

		const submit = updateCodigoPreco => {
			const alteracoes = Object.values(atualizacoes).filter(a => a.alterado).map(a => ({
				unidade_uuid: a.unidade.uuid,
				update: {
					ativo: a.ativo,
					bloqueado: a.bloqueado,
					oferta: {
						valor: a.oferta_valor,
						ativo: a.oferta_ativo,
						periodo: {
							inicio: a.oferta_inicio,
							fim: a.oferta_fim,
						},
					},
					preco1: {
						valor: a.preco1_valor,
						margem: a.preco1_margem,
						margem_minima: a.preco1_margem_minima,
						fator: a.preco1_fator,
					},
					preco2: {
						valor: a.preco2_valor,
						// margem: a.preco2_margem,
						// fator: a.preco2_fator,
					},
					preco3: {
						valor: a.preco3_valor,
						margem: a.preco3_margem,
						fator: a.preco3_fator,
					},
					preco4: {
						valor: a.preco4_valor,
						margem: a.preco4_margem,
						fator: a.preco4_fator,
					},
					preco5: {
						valor: a.preco5_valor,
						margem: a.preco5_margem,
						fator: a.preco5_fator,
					},
				},
			}));

			FluxoAPI.updateProduto(
				fluxoUUID ? fluxoUUID : '-',
				produto.uuid,
				{
					origem: fluxoUUID ? null : fluxoOrigem,
					unidades: alteracoes,
					update_codigo_preco: updateCodigoPreco === true,
					update_mask: { paths: ['ativo', 'bloqueado', 'oferta', 'preco1', 'preco2', 'preco3', 'preco4', 'preco5'] }
				})
				.then(() => {
					alerts.snackbars.success('Alterações salvas com sucesso.');
					if (closeOnSave) {
						onClose(true);
						return;
					}
					reloadPrecos();
				})
				.catch(defaultProcessCatch());
		}

		if (`${produto.codigo_preco || ''}`.length) {
			alerts.confirmYesNo(
				'Alteração de Produto via Código de Preço',
				'O produto atual está vinculado a um código de preço, deseja atualizar os preços dos demais produtos com o mesmo código de preço?',
				{
					showCancel: true,
					onResponse: response => {
						submit(response);
					},
				}
			)
			return;
		}

		submit(false);
	}

	const renderActiveTab = () => {
		if (!produtoUnidade) return;

		switch (activeTab) {
			case tabs.unidade:
				return (
					<TabUnidade
						produto={produto}
						produtoUnidade={produtoUnidade}
						curvas={curvas}
						loadingCurvas={loadingCurvas}
						atualizacoes={atualizacoes[produtoUnidade.unidade.uuid]}
						onChangeField={changes => onChangeAtualizacao(produtoUnidade.unidade, changes)}
						stats={stats[produtoUnidade.unidade.uuid]}
						canEditFieldUnidade={canEditFieldUnidade} />
				);
			case tabs.alteracoes:
				return <TabAlteracoes produto={produto} produtoUnidade={produtoUnidade} />;

			case tabs.historico:
				return <TabHistorico produto={produto} produtoUnidade={produtoUnidade} fluxoUUID={fluxoUUID} />;
			default:
				return null;
		}
	}

	const canEditFieldUnidade = unidade => {
		if (fluxoOrigem === FluxoOrigem.AQUISICAO || (fluxo && fluxo.origem === FluxoOrigem.AQUISICAO)) {
			return true;
		}
		return (fluxo.unidades || []).filter(u => u.uuid === unidade.uuid).length > 0;
	}

	const onChangeAtualizacao = (unidade, fields) => {
		if (!canEditFieldUnidade(unidade)) return;

		setHasChanges(true);
		setAtualizacoes({
			...atualizacoes,
			[unidade.uuid]: {
				...atualizacoes[unidade.uuid],
				...fields,
				alterado: true,
			},
		});
	}

	const rows = (produto.unidades || []).map(u => ({ ...u, atualizacao: atualizacoes[u.unidade.uuid] }));
	const renderRow = (row, dados) => ({
		selected: dados.unidade.codigo === unidade.codigo,
		onClick: () => setUnidade(dados.unidade),
		...row,
	});

	return (
		<React.Fragment>
			<Dialog fullScreen open={true} onClose={() => onClose()}>
				<DialogTitle>
					Edição de Produto: {produto.codigo} - {produto.descricao}
				</DialogTitle>

				<DialogContent>
					<Grid container spacing={2}>
						<Grid item xs={4} md={2}><LabelValue label="Código de Barras">{produto.codigo_barra}</LabelValue></Grid>
						<Grid item xs={4} md={2}><LabelValue label="Departamento">{produto.departamento.nome}</LabelValue></Grid>
						<Grid item xs={4} md={2}><LabelValue label="Categoria">{produto.categoria.nome}</LabelValue></Grid>
						<Grid item xs={4} md={2}><LabelValue label="Marca">{produto.marca}</LabelValue></Grid>
						<Grid item xs={4} md={2}><LabelValue label="Complemento">{produto.complemento}</LabelValue></Grid>
						<Grid item xs={4} md={2}><LabelValue label="Código Preço">{produto.codigo_preco}</LabelValue></Grid>
					</Grid>

					<Box p={1} />
					<Typography variant="h6" color="primary">Unidades</Typography>
					<Divider />
					<Box p={0.5} />

					<TableSort size="small" rows={rows} renderRow={renderRow} style={{ zoom: '90%' }}>
						<TableSortColumn field="unidade.codigo" title="Código" width={120} />
						<TableSortColumn field="unidade.codigo" title="Nome" />

						<TableSortColumn width={120} align="right" field="preco_compra" title="Preço Compra"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR_COMPRA)}`} />

						<TableSortColumn width={120} align="right" field="custo_total" title="Custo Total"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR_COMPRA)}`} />

						<TableSortColumn width={120} align="right" field="preco_sugerido" title="Preço Sugerido"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn width={170} field="atualizacao.preco1_valor" title="Preço Venda"
							formatter={(preco1_valor, row) => (
								<CustomTextField
									disabled={!canEditFieldUnidade(row.unidade)}
									value={preco1_valor}
									onChange={preco1_valor => onChangeAtualizacao(row.unidade, { preco1_valor })} />
							)} />

						<TableSortColumn width={100} field="atualizacao.oferta_ativo" title="Em Oferta" align="center"
							formatter={(oferta_ativo, row) => (
								<Checkbox
									disabled={!canEditFieldUnidade(row.unidade)}
									value={oferta_ativo}
									onChange={oferta_ativo => onChangeAtualizacao(row.unidade, { oferta_ativo })} />
							)} />

						<TableSortColumn width={170} field="atualizacao.oferta_valor" title="Preço Oferta"
							formatter={(oferta_valor, row) => (
								<CustomTextField
									disabled={!canEditFieldUnidade(row.unidade)}
									value={oferta_valor}
									onChange={oferta_valor => onChangeAtualizacao(row.unidade, { oferta_valor })} />
							)} />

						<TableSortColumn width={240} title="Vencimento Oferta"
							formatter={(_, row) => (
								<DateRangePicker
									disabled={!canEditFieldUnidade(row.unidade)}
									inputVariant="standard"
									margin="none"
									format="DD/MM/YYYY"
									value={[row.atualizacao.oferta_inicio, row.atualizacao.oferta_fim]}
									onChange={periodo => onChangeAtualizacao(row.unidade, {
										oferta_inicio: periodo[0],
										oferta_fim: periodo[1],
									})} />
							)} />

						<TableSortColumn width={120} field="atualizacao.preco1_margem_minima" title="Margem Min."
							formatter={(preco1_margem_minima, row) => {
								return (
								<NumberField
									disabled={!canEditFieldUnidade(row.unidade)}
									variant="standard"
									margin="none"
									decimals={3}
									value={preco1_margem_minima}
									onChange={preco1_margem_minima => onChangeAtualizacao(row.unidade, { preco1_margem_minima })}
									InputProps={{
										endAdornment: <InputAdornment position="end">%</InputAdornment>
									}} />
							)}} />

						<TableSortColumn width={120} field="atualizacao.preco1_margem" title="Margem"
							formatter={(preco1_margem, row) => (
								<NumberField
									disabled={!canEditFieldUnidade(row.unidade)}
									variant="standard"
									margin="none"
									decimals={3}
									value={preco1_margem}
									onChange={preco1_margem => onChangeAtualizacao(row.unidade, { preco1_margem })}
									InputProps={{
										endAdornment: <InputAdornment position="end">%</InputAdornment>
									}} />
							)} />

						<TableSortColumn width={120} align="right" field="margem_atual" title="Margem Atual"
							formatter={v => `${numberFormat(v, DECIMAIS.MARGEM_LUCRO)}%`} />

						<TableSortColumn width={120} align="right" field="stats.lucro_atual" title="Lucro Atual"
							formatter={v => `R$ ${numberFormat(v, DECIMAIS.VALOR)}`} />

						<TableSortColumn width={100} field="atualizacao.ativo" title="Ativo" align="center"
							formatter={(ativo, row) => (
								<Checkbox
									disabled={!canEditFieldUnidade(row.unidade)}
									value={ativo}
									onChange={ativo => onChangeAtualizacao(row.unidade, { ativo })} />
							)} />

						<TableSortColumn width={100} field="atualizacao.bloqueado" title="Bloqueado" align="center"
							formatter={(bloqueado, row) => (
								<Checkbox
									disabled={!canEditFieldUnidade(row.unidade)}
									color="secondary"
									value={bloqueado}
									onChange={bloqueado => onChangeAtualizacao(row.unidade, { bloqueado })} />
							)} />

						<TableSortColumn width={60} field="atualizacao.has_alteracoes" align="center"
							formatter={has_alteracoes => (
								<CheckIcon style={{ color: has_alteracoes ? '#005f04' : '#c50e00' }} />
							)}
						/>
					</TableSort>

					<Box p={1} />
					<Tabs
						indicatorColor="primary"
						textColor="primary"
						value={activeTab}
						onChange={(_, v) => setActiveTab(v)}>
						<Tab value={tabs.unidade} label={`Unidade: ${unidade.nome}`} wrapped />
						<Tab value={tabs.alteracoes} label="Status de Alteração" />
						<Tab value={tabs.historico} label="Campos Alterados" />
					</Tabs>

					<Typography variant="h6" color="primary"></Typography>
					<Divider />
					<Box p={1} />

					{renderActiveTab()}
				</DialogContent>

				<DialogActions>
					<Button color="secondary" onClick={openCalculadora} style={{ marginRight: 'auto' }}>
						Calculadora de Preço
					</Button>

					<Button onClick={handleClose}>Fechar</Button>
					<Button color="primary" variant="contained" disabled={!hasChanges} onClick={handleSubmit}>
						Salvar
					</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}

export default EdicaoPrecoDialog;
