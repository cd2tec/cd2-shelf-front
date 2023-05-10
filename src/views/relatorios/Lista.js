import React, { useContext, useState } from 'react';

import { Grid, Card, CardHeader, CardContent, makeStyles, colors, MenuItem } from '@material-ui/core';

import Page from '../../components/Page';

import PricingCompetitividadeProdutos from './pricing/CompetitividadeProdutos';
import PricingCompetitividadeComparativo from './pricing/CompetitividadeComparativo';
import PricingWorkflowFluxosStatus from './pricing/WorkflowFluxosStatus';
import PricingWorkflowProdutos from './pricing/WorkflowProdutos';
import PricingPrecificacaoProdutosLucroAtualBaixoMinimoIdeal from './pricing/PrecificacaoProdutosLucroAtualBaixoMinimoIdeal';
import PricingPrecificacaoPrecosAlterados from './pricing/PrecificacaoPrecosAlterados';
import { SelectField } from '../../components/material';
import alerts from '../../utils/alerts';
import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

const useStyles = makeStyles(() => ({
	cardRelatorio: {
		'&:hover': {
			backgroundColor: colors.grey[200],
			cursor: 'pointer',
			transform: 'scale(1.02)',
		},
		transition: 'all 0.2s',
	},
}));

function CardRelatorio({ relatorio: { title, modulo, area, observacao }, onClick }) {
	const classes = useStyles();

	return (
		<Card className={classes.cardRelatorio} onClick={onClick}>
			<CardHeader title={title} subheader={`${modulo}${area ? ` > ${area}` : ''}`} />
			{observacao ? <CardContent>{observacao}</CardContent> : null}
		</Card>
	);
}

const MODULOS = {
	PRICING: 'Pricing',
};

const AREA = {
	ACAO_VENDA: 'Ação de Vendas',
	COMPETITIVIDADE: 'Competitividade',
	GESTAO_CATEGORIA: 'Gestão de Categorias',
	RELEASE_WORKFLOW: 'Release Workflow',
	PRECIFICACAO: 'Precificação',
}

function Lista() {
	const [dialog, setDialog] = useState();
  const { permissoes } = useContext(LoggedContext);
	const [filtroArea, setFiltroArea] = useState();

	const relatorios = [
		{
			title: 'Realização de Pesquisa',
			modulo: MODULOS.PRICING,
			area: AREA.COMPETITIVIDADE,
			Component: PricingCompetitividadeProdutos,
		},
		{
			title: 'Comparativo de Pesquisa',
			modulo: MODULOS.PRICING,
			area: AREA.COMPETITIVIDADE,
			Component: PricingCompetitividadeComparativo,
		},
		{
			title: '(DEV) Análise do Menor Preço',
			modulo: MODULOS.PRICING,
			area: AREA.COMPETITIVIDADE,
			Component: null,
		},
		{
			title: '(DEV) Ações de Vendas',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Ações de Combate',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Ações de Recuperação',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Performance',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Comparativo de Resultados',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Status das Ações',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Tipos de Ações de Vendas',
			modulo: MODULOS.PRICING,
			area: AREA.ACAO_VENDA,
			Component: null,
		},
		{
			title: '(DEV) Análise de Performance',
			modulo: MODULOS.PRICING,
			area: AREA.GESTAO_CATEGORIA,
			Component: null,
		},
		{
			title: '(DEV) Cronograma',
			modulo: MODULOS.PRICING,
			area: AREA.GESTAO_CATEGORIA,
			Component: null,
		},
		{
			title: '(DEV) Marcas/Produtos das Categorias',
			modulo: MODULOS.PRICING,
			area: AREA.GESTAO_CATEGORIA,
			Component: null,
		},
		{
			title: '(DEV) Produtos nas GCs',
			modulo: MODULOS.PRICING,
			area: AREA.GESTAO_CATEGORIA,
			Component: null,
		},
		{
			title: '(DEV) Status do Cronograma na GC',
			modulo: MODULOS.PRICING,
			area: AREA.GESTAO_CATEGORIA,
			Component: null,
		},
		{
			title: 'Preços Alterados',
			modulo: MODULOS.PRICING,
			area: AREA.PRECIFICACAO,
			Component: PricingPrecificacaoPrecosAlterados,
		},
		{
			title: 'Produtos com Lucro Atual abaixo do Mínimo e Ideal',
			modulo: MODULOS.PRICING,
			area: AREA.PRECIFICACAO,
			Component: PricingPrecificacaoProdutosLucroAtualBaixoMinimoIdeal,
		},
		{
			title: '(DEV) Entrada de Produtos',
			modulo: MODULOS.PRICING,
			area: AREA.PRECIFICACAO,
			Component: null,
		},
		{
			title: '(DEV) Produtos com preços divergentes na entrada',
			modulo: MODULOS.PRICING,
			area: AREA.PRECIFICACAO,
			Component: null,
		},
		{
			title: 'Fluxos e Status',
			modulo: MODULOS.PRICING,
			area: AREA.RELEASE_WORKFLOW,
			Component: PricingWorkflowFluxosStatus,
		},
		{
			title: 'Produtos inseridos em Workflow',
			modulo: MODULOS.PRICING,
			area: AREA.RELEASE_WORKFLOW,
			Component: PricingWorkflowProdutos,
		},
	];

	const openRelatorio = r => {
		if (r.Component) {
			setDialog(<r.Component relatorio={r} onClose={() => setDialog()} />);
			return;
		}
		alerts.snackbars.warning('Relatório não liberado');
	}

	return (
		<Page title="Relatórios" style={{ padding: 16 }}>
      {userCan(permissoes, 'relatórios - visualizar e gerar relatórios') ?
        <>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <SelectField
                label="Funcionalidade"
                value={filtroArea}
                onChange={v => setFiltroArea(v)}>
                <MenuItem>- Todos -</MenuItem>
                <MenuItem value={AREA.COMPETITIVIDADE}>{AREA.COMPETITIVIDADE}</MenuItem>
                <MenuItem value={AREA.ACAO_VENDA}>{AREA.ACAO_VENDA}</MenuItem>
                <MenuItem value={AREA.GESTAO_CATEGORIA}>{AREA.GESTAO_CATEGORIA}</MenuItem>
                <MenuItem value={AREA.PRECIFICACAO}>{AREA.PRECIFICACAO}</MenuItem>
                <MenuItem value={AREA.RELEASE_WORKFLOW}>{AREA.RELEASE_WORKFLOW}</MenuItem>
              </SelectField>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {(filtroArea ? relatorios.filter(r => r.area === filtroArea) : relatorios).map((r, key) => (
              <Grid key={key} item xs={3}>
                <CardRelatorio relatorio={r} onClick={() => openRelatorio(r)} />
              </Grid>
            ))}
          </Grid>
        </> : null
      }
			
			{dialog}
		</Page>
	);
}

export default Lista;
