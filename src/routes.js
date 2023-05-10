import React from 'react';
import { Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LoggedLayout from "./layouts/LoggedLayout";
import LoginView from './views/auth/LoginView';
// import RegisterView from './views/auth/RegisterView';

//pages
import DashboardPage from './views/dashboard';

import ProdutosPage from './views/produtos/Lista';
import ProdutosCadastroPage from './views/produtos/Cadastro';
import FornecedoresPage from './views/fornecedores/Lista';
import ConcorrentesPage from './views/concorrentes/Lista';
import UnidadesPage from './views/unidades/Lista';
import PedidosPage from './views/pedidos/Lista';
import PedidosVerPage from './views/pedidos/Ver';
import PricingCompetitividadeListaPage from './views/pricing/competitividade/Lista';
import PricingCompetitividadeViewPage from './views/pricing/competitividade/View';
import PricingCompetitividadeCadastroPage from './views/pricing/competitividade/Cadastro';
import PricingFluxoListaPage from './views/pricing/fluxo/Lista';
import PricingPrecificacaoPage from './views/pricing/precificacao/Precificacao';
import PricingGestaoCategoriaListaPage from './views/pricing/gestao-categoria/Lista';
import PricingGestaoCategoriaViewPage from './views/pricing/gestao-categoria/View';
import PricingGestaoCategoriaAnalisePerformanceViewPage from './views/pricing/gestao-categoria/AnalisePerformance';
import TipoPesquisaListaPage from './views/tipo-pesquisa/Lista';
import TipoPesquisaCadastroPage from './views/tipo-pesquisa/Cadastro';
import ModeloPrecificacaoListaPage from './views/modelo-precificacao/Lista';
import ModeloPrecificacaoCadastroPage from './views/modelo-precificacao/Cadastro';
import AnalisePerformanceAcaoPage from './views/analise-performance-acao/Relatorio';
import AcaoVendasListaPage from './views/acao-vendas/Lista';
import AcaoVendasCadastroPage from './views/acao-vendas/Cadastro';
import TipoAcaoVendasListaPage from './views/tipo-acao-vendas/Lista';
import TipoAcaoVendasNovoPage from './views/tipo-acao-vendas/Cadastro';
import ListaRelatoriosPage from './views/relatorios/Lista';
import GestaoUsuariosPage from './views/gestao-usuarios';
import GestaoUsuariosPerfisCadastroPage from './views/gestao-usuarios/perfis/Cadastro';
import GestaoUsuariosUsuariosCadastroPage from './views/gestao-usuarios/usuarios/cadastro';
import CategoriasSimilaresListaPage from './views/categorias-similares/Lista';
import CategoriasSimilaresCadastroPage from './views/categorias-similares/Cadastro';
import LoginAdminPage from './views/auth/LoginAdmin';
import AdminLoggedLayout from './layouts/AdminLoggedLayout';
import EmpresasAdminListaPage from './views/empresas-admin/Lista';
import EmpresasAdminCadastroPage from './views/empresas-admin/Cadastro';
import EmpresasAdminInfoPage from './views/empresas-admin/info';
import EmpresasAdminDetalhes from './views/empresas-admin/info/movimentos/Detalhes';
import UsuariosAdminListaPage from './views/usuarios-admin/Lista';
import UsuariosAdminCadastroPage from './views/usuarios-admin/Cadastro';
import PermissoesAdminListaPage from './views/permissoes-admin/Lista';
import PermissoesAdminCadastroPage from './views/permissoes-admin/Cadastro';
import CurvasAdminCadastroPage from './views/empresas-admin/info/curvas/Cadastro';
import APIKEYAdminCadastroPage from './views/empresas-admin/info/apikeys/Cadastro';
import IntegradoresList from './views/integradores-admin/Lista';

const routes = [
	{
		path: 'app',
		element: <LoggedLayout />,
		children: [
			{ path: '/', element: <Navigate to="dashboard" /> },
			{ path: 'dashboard', element: <DashboardPage /> },
			{ path: 'unidades', element: <UnidadesPage /> },
			{ path: 'fornecedores', element: <FornecedoresPage /> },
			{ path: 'concorrentes', element: <ConcorrentesPage /> },
			{ path: 'produtos', element: <ProdutosPage /> },
			{ path: 'produtos/:uuid', element: <ProdutosCadastroPage /> },
			{ path: 'pedidos', element: <PedidosPage /> },
			{ path: 'pedidos/:id', element: <PedidosVerPage /> },
			{ path: 'pricing/competitividade', element: <PricingCompetitividadeListaPage /> },
			{ path: 'pricing/competitividade/novo', element: <PricingCompetitividadeCadastroPage /> },
			{ path: 'pricing/competitividade/:uuid', element: <PricingCompetitividadeViewPage /> },
			{ path: 'pricing/precificacao', element: <PricingPrecificacaoPage /> },
			{ path: 'pricing/release-workflow', element: <PricingFluxoListaPage /> },
			{ path: 'pricing/gestao-categorias', element: <PricingGestaoCategoriaListaPage /> },
			{ path: 'pricing/gestao-categorias/novo', element: <PricingGestaoCategoriaViewPage /> },
			{ path: 'pricing/gestao-categorias/:uuid', element: <PricingGestaoCategoriaViewPage /> },
			{ path: 'pricing/gestao-categorias/analise-performance', element: <PricingGestaoCategoriaAnalisePerformanceViewPage /> },
			{ path: 'tipo-pesquisa', element: <TipoPesquisaListaPage /> },
			{ path: 'tipo-pesquisa/:uuid', element: <TipoPesquisaCadastroPage /> },
			{ path: 'tipo-pesquisa/novo', element: <TipoPesquisaCadastroPage /> },
			{ path: 'modelos-precificacao', element: <ModeloPrecificacaoListaPage /> },
			{ path: 'modelos-precificacao/novo', element: <ModeloPrecificacaoCadastroPage /> },
			{ path: 'modelos-precificacao/:uuid', element: <ModeloPrecificacaoListaPage /> },
			{ path: 'pricing/acao-vendas', element: <AcaoVendasListaPage /> },
			{ path: 'pricing/acao-vendas/cadastrar', element: <AcaoVendasCadastroPage /> },
			{ path: 'pricing/acao-vendas/:uuid', element: <AcaoVendasCadastroPage /> },
			{ path: 'pricing/acao-vendas/analise-performance', element: <AnalisePerformanceAcaoPage /> },
			{ path: 'tipo-acao-vendas', element: <TipoAcaoVendasListaPage /> },
			{ path: 'tipo-acao-vendas/:uuid', element: <TipoAcaoVendasNovoPage /> },
			{ path: 'tipo-acao-vendas/novo', element: <TipoAcaoVendasNovoPage /> },
			{ path: 'relatorios', element: <ListaRelatoriosPage /> },
			{ path: 'gestao-usuarios', element: <GestaoUsuariosPage /> },
      { path: 'gestao-usuarios/usuarios/novo', element: <GestaoUsuariosUsuariosCadastroPage /> },
			{ path: 'gestao-usuarios/usuarios/:uuid', element: <GestaoUsuariosUsuariosCadastroPage /> },
			{ path: 'gestao-usuarios/perfis/novo', element: <GestaoUsuariosPerfisCadastroPage /> },
      { path: 'gestao-usuarios/perfis/:uuid', element: <GestaoUsuariosPerfisCadastroPage /> },
      { path: 'categorias-similares', element: <CategoriasSimilaresListaPage/> },
      { path: 'categorias-similares/atualizar', element: <CategoriasSimilaresCadastroPage/> },
      { path: 'categorias-similares/atualizar/:id', element: <CategoriasSimilaresCadastroPage/> },
			{ path: '*', element: <Navigate to="/app" /> },
		],
	},
  {
		path: 'admin/login',
		element: <MainLayout />,
		children: [
			{ path: '/', element: <LoginAdminPage /> },
		],
	},
  {
		path: 'admin/',
		element: <AdminLoggedLayout />,
		children: [
      { path: '/', element: <Navigate to="empresas" /> },
			{ path: 'empresas', element: <EmpresasAdminListaPage /> },
      { path: 'empresas/novo', element: <EmpresasAdminCadastroPage /> },
      { path: 'empresas/:uuid/:recurso', element: <EmpresasAdminInfoPage /> },
      { path: 'empresas/:uuid/movimentos/detalhes', element: <EmpresasAdminDetalhes /> },
      { path: 'usuarios', element: <UsuariosAdminListaPage /> },
      { path: 'usuarios/atualizar/:user', element: <UsuariosAdminCadastroPage /> },
      { path: 'usuarios/novo', element: <UsuariosAdminCadastroPage /> },
      { path: 'permissoes', element: <PermissoesAdminListaPage /> },
      { path: 'permissoes/novo', element: <PermissoesAdminCadastroPage /> },
      { path: 'empresas/:uuid/curvas/novo', element: <CurvasAdminCadastroPage /> },
      { path: 'empresas/:uuid/apikeys/novo', element: <APIKEYAdminCadastroPage /> },
			{ path: 'integradores', element: < IntegradoresList/>},
			{ path: 'integradores/:id', element: < IntegradoresList/>},
			{ path: '*', element: <Navigate to="/admin" /> },
		],
	},
	{
		path: '/',
		element: <MainLayout />,
		children: [
			{ path: '/', element: <Navigate to="login" /> },
			{ path: 'login', element: <LoginView /> },
			{ path: '*', element: <Navigate to="/" /> },
		],
	}
];

export default routes;
