import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Avatar, Box, Drawer, Hidden, List, Typography, makeStyles } from '@material-ui/core';

import NavItem from './NavItem';
import LoggedContext from '../../../context/LoggedContext';
import { Shelf } from '../../../assets/logos';

import {
	Dashboard as DashboardIcon,
	EditPaper as CadastrosIcon,
	MoneyTag as PricingIcon,
	ThreeCubes as SupplyIcon,
	BarChartDown as LossIcon,
	BarChart as AnalyticsIcon,

	Settings as SettingsIcon,
	Question as HelpIcon,
	ExitDoor as ExitIcon,
} from '../../../assets/icones';

import { themeConfig } from '../../../theme';

const useStyles = makeStyles(() => ({
	mobileDrawer: {
		width: themeConfig.drawerWidth,
	},
	desktopDrawer: {
		width: themeConfig.drawerWidth,
	},
	avatar: {
		cursor: 'pointer',
		width: 64,
		height: 64,
		marginBottom: 12,
	},
	root: {
		height: '100%',
		backgroundColor: '#004a77',
		'& *': {
			color: 'white',
		},
		overflowY: 'auto',
	},
}));

const getMenu = (permissoes) => {
  const p = permissoes.map(i => i.permissao)

  const items = [{
    href: 'dashboard',
    icon: DashboardIcon,
    title: 'Dashboard'
  }];

  const cadastrosProdutos = p.includes('cadastros - visualizar produtos')
  const cadastrosUnidades = p.includes('cadastros - visualizar unidades')
  const cadastrosFornecedores = p.includes('cadastros - visualizar fornecedores')
  const cadastrosConcorrentes = p.includes('cadastros - visualizar concorrentes')

  if(cadastrosProdutos || cadastrosUnidades || cadastrosFornecedores || cadastrosConcorrentes) {
    items.push({
      title: 'Cadastros',
      icon: CadastrosIcon,
      items: []
    })
  }

  if(cadastrosProdutos) {
    items[items.length - 1].items.push({
		  href: 'produtos',
			title: 'Produtos'
		})
  }

  if(cadastrosUnidades) {
    items[items.length - 1].items.push({
		  href: 'unidades',
			title: 'Unidades'
		})
  }

  if(cadastrosFornecedores) {
    items[items.length - 1].items.push({
      href: 'fornecedores',
      title: 'Fornecedores'
    })
  }

  if(cadastrosConcorrentes) {
    items[items.length - 1].items.push({
      href: 'concorrentes',
      title: 'Concorrentes'
    })
  }

  const pricingCompetitividadePesquisa = p.includes('pricing - competitividade - visualizar pesquisas')
  const pricingAcaoVenda = p.includes('pricing - ação de vendas - visualizar ações de vendas')
  const pricingGestaoCategorias = p.includes('pricing - gestão de categorias - visualizar processos de gestão de categorias')
  const pricingPrecificacao = p.includes('pricing - precificação - gerar precificação')
  const pricingWorkflow = p.includes('pricing - release workflow - visualizar workflows')

  if(pricingCompetitividadePesquisa || pricingAcaoVenda || pricingGestaoCategorias || pricingPrecificacao || pricingWorkflow) {
    items.push({
      title: 'Pricing',
		  icon: PricingIcon,
		  items: []
    })
  }

  if(pricingCompetitividadePesquisa) {
    items[items.length - 1].items.push({
      href: 'pricing/competitividade',
			title: 'Competitividade'
		})
  }

  if(pricingAcaoVenda) {
    items[items.length - 1].items.push({
      href: 'pricing/acao-vendas',
			title: 'Ação de Vendas'
    })
  }

  if(pricingGestaoCategorias) {
    items[items.length - 1].items.push({
      href: 'pricing/gestao-categorias',
			title: 'Gestão de Categorias'
    })
  }

  if(pricingPrecificacao) {
    items[items.length - 1].items.push({
      href: 'pricing/precificacao',
			title: 'Precificação'
    })
  }

  if(pricingWorkflow) {
    items[items.length - 1].items.push({
      href: 'pricing/release-workflow',
			title: 'Release Workflow'
    })
  }

  items.push({
		title: 'Supply',
		icon: SupplyIcon,
		items: [null],
	},
	{
		title: 'Loss',
		icon: LossIcon,
		items: [null],
	},
	{
		title: 'Analytics',
		icon: AnalyticsIcon,
		items: [null],
	})

  if(p.includes('relatórios - visualizar e gerar relatórios')) {
    items.push({
      href: 'relatorios',
      icon: DashboardIcon,
      title: 'Relatórios'
    })
  }

  const configTipoPesquisa = p.includes('configurações - visualizar tipos de pesquisa')
  const configTipoAcaoVenda = p.includes('configurações - visualizar tipos de ação de vendas')
  const configModelosPrecificacao = p.includes('configurações - visualizar modelos de precificação')
  const configGestaoUsuario = p.includes('configurações - gestão de usuários - visualizar gestão de usuários')
  const configCategoriasSimilares = p.includes('configurações - categorias similares - visualizar categorias similares')

  if(configTipoPesquisa || configTipoAcaoVenda || configModelosPrecificacao || configGestaoUsuario) {
    items.push({
      title: 'Configurações',
		  icon: SettingsIcon,
		  items: []
    })
  }

  if(configTipoPesquisa) {
    items[items.length - 1].items.push({
      href: 'tipo-pesquisa',
			title: 'Tipo de Pesquisa'
		})
  }

  if(configTipoAcaoVenda) {
    items[items.length - 1].items.push({
      href: 'tipo-acao-vendas',
			title: 'Tipo de Ação de Vendas'
		})
  }

  if(configModelosPrecificacao) {
    items[items.length - 1].items.push({
      href: 'modelos-precificacao',
			title: 'Modelo Precificação'
		})
  }

  if(configCategoriasSimilares) {
    items[items.length - 1].items.push({
      href: 'categorias-similares',
			title: 'Categorias Similares'
		})
  }

  if(configGestaoUsuario) {
    items[items.length - 1].items.push({
      href: 'gestao-usuarios',
			title: 'Gestão de Usuários'
		})
  }

  return items;
}

const NavBar = ({ onMobileClose, openMobile }) => {
	const { usuario, entidade, permissoes } = useContext(LoggedContext);
	const classes = useStyles();
	const location = useLocation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getMenu(permissoes) || [])
  }, [permissoes]);

	useEffect(() => {
		if (openMobile && onMobileClose) {
			onMobileClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const content = (
		<div className={classes.root}>
			<Box
				alignItems="center"
				display="flex"
				flexDirection="column"
				p={2}>
				<div style={{ margin: 18, marginBottom: 32, filter: 'invert(1)' }}>
					<Shelf width="70%" />
				</div>

				<Avatar
					className={classes.avatar}
					component={RouterLink}
					src={usuario.avatar}
					to="/app/account" />

				<Typography
					className={classes.name}
					color="textPrimary"
					variant="h5">
					{usuario.nome_completo}
				</Typography>

				<Typography
					color="textSecondary"
					variant="body2">
					{entidade.nome}
				</Typography>
			</Box>

			<Box p={5}>
				<List>
					{items.map((item, index) => (
						<NavItem
							key={index}
							href={item.href}
							title={item.title}
							icon={item.icon}
							items={item.items || []}
						/>
					))}
				</List>
			</Box>

			<Box p={5}>
				<List>
					<NavItem
						title="Ajuda"
						icon={HelpIcon} />

					<NavItem
						title="Sair"
						icon={ExitIcon} />
				</List>
			</Box>
		</div>
	);

	return (
		<>
			<Hidden lgUp>
				<Drawer
					anchor="left"
					classes={{ paper: classes.mobileDrawer }}
					onClose={onMobileClose}
					open={openMobile}
					variant="temporary">
					{content}
				</Drawer>
			</Hidden>
			<Hidden mdDown>
				<Drawer
					anchor="left"
					classes={{ paper: classes.desktopDrawer }}
					open
					variant="persistent">
					{content}
				</Drawer>
			</Hidden>
		</>
	);
};

NavBar.propTypes = {
	onMobileClose: PropTypes.func,
	openMobile: PropTypes.bool
};

NavBar.defaultProps = {
	onMobileClose: () => { },
	openMobile: false
};

export default NavBar;
