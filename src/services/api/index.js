import portableFetch from 'portable-fetch';
import cd from 'content-disposition';

import {
	ProdutoServiceApi,
	UsuarioServiceApi,
	UnidadeServiceApi,
	ConcorrenteServiceApi,
	FornecedorServiceApi,
	PesquisaServiceApi,
	TipoPesquisaServiceApi,
	ModeloPrecificacaoServiceApi,
	CurvaServiceApi,
	CategoriaServiceApi,
	DepartamentoServiceApi,
	AcaoVendaServiceApi,
	FluxoServiceApi,
	GestaoCategoriaServiceApi,
	AdquiridoServiceApi,
	AnalyticsApi,
	RelatorioServiceApi,
	EntidadeServiceApi,
	PermissaoServiceApi,
  PerfilServiceApi,
	IntegracaoServiceApi,

	ProdutoUnidadeCampoAdicionalTipo,
	FornecedorTipoInscricao,
	AuthenticateUsuarioRequestGrantType,
	PesquisaEtapa,
	ModeloPrecificacaoTipoPrecificacao as TipoPrecificacao,
	UnitrierAcaoVendaStatus as AcaoVendaStatus,
	FluxoOrigem,
	UnitrierFluxoStatus as FluxoStatus,
	GestaoCategoriaRankingCurva,
	UnitrierGerarGraficoAnalisePerformanceRequestTipo as GerarGraficoAnalisePerformanceRequestTipo,
	ListProdutosAdquiridosRequestSituacao as ListProdutosAdquiridosSituacao,
	AcaoVendaModelo,
	UnitrierInicializarPrecosRequestModo as InicializarPrecosRequestModo,
	UnitrierMovimentoTipo as MovimentoTipo,
	UnitrierGerarRelatorioPrecificacaoRequestModo as GerarRelatorioPrecificacaoRequestModo,
	UnitrierInicializarPrecosAcaoVendaRequestAcao as InicializarPrecosAcaoVendaRequestAcao,
	GestaoCategoriaCategoriaStatsStatus,
} from './generated';

import { defaultProcessCatch, filterErrors, Errors } from './utils';

if (process.env.NODE_ENV !== 'production') {
	const imports = {
		ProdutoServiceApi,
		UsuarioServiceApi,
		UnidadeServiceApi,
		ConcorrenteServiceApi,
		FornecedorServiceApi,
		PesquisaServiceApi,
		TipoPesquisaServiceApi,
		ModeloPrecificacaoServiceApi,
		CurvaServiceApi,
		CategoriaServiceApi,
		DepartamentoServiceApi,
		AcaoVendaServiceApi,
		FluxoServiceApi,
		GestaoCategoriaServiceApi,
		AdquiridoServiceApi,
		AnalyticsApi,
		RelatorioServiceApi,
		EntidadeServiceApi,
		PermissaoServiceApi,
    PerfilServiceApi,
		IntegracaoServiceApi,

		ProdutoUnidadeCampoAdicionalTipo,
		FornecedorTipoInscricao,
		AuthenticateUsuarioRequestGrantType,
		PesquisaEtapa,
		TipoPrecificacao,
		AcaoVendaStatus,
		FluxoOrigem,
		FluxoStatus,
		GestaoCategoriaRankingCurva,
		GerarGraficoAnalisePerformanceRequestTipo,
		ListProdutosAdquiridosSituacao,
		AcaoVendaModelo,
		InicializarPrecosRequestModo,
		MovimentoTipo,
		GerarRelatorioPrecificacaoRequestModo,
		InicializarPrecosAcaoVendaRequestAcao,
		GestaoCategoriaCategoriaStatsStatus,
	};
	for (let name in imports) {
		if (!imports[name]) {
			throw new Error(`Módulo '${name}' não encontrado.`);
		}
	}
}

let config = { basePath: process.env.REACT_APP_API_ENDPOINT };
let entidade = new EntidadeServiceApi(config);
let produto = new ProdutoServiceApi(config);
let usuario = new UsuarioServiceApi(config);
let unidade = new UnidadeServiceApi(config);
let concorrente = new ConcorrenteServiceApi(config);
let fornecedor = new FornecedorServiceApi(config);
let pesquisa = new PesquisaServiceApi(config);
let tipoPesquisa = new TipoPesquisaServiceApi(config);
let modeloPrecificacao = new ModeloPrecificacaoServiceApi(config);
let curva = new CurvaServiceApi(config);
let categoria = new CategoriaServiceApi(config);
let departamento = new DepartamentoServiceApi(config);
let acaoVenda = new AcaoVendaServiceApi(config);
let fluxo = new FluxoServiceApi(config);
let gestaoCategoria = new GestaoCategoriaServiceApi(config);
let analytics = new AnalyticsApi(config);
let adquirido = new AdquiridoServiceApi(config);
let integracao = new IntegracaoServiceApi(config);
let relatorio = new RelatorioServiceApi(config, null, (url, init) => {
	return portableFetch(url, init)
		.then(rs => {
			const contentDispositionHeader = rs.headers.get('Content-Disposition');
			if (!contentDispositionHeader) {
				return rs;
			}

			const disposition = cd.parse(contentDispositionHeader);

			return {
				status: rs.status,
				json: async () => {
					const blob = await rs.blob();
					return {
						blob,
						disposition: {
							type: disposition.type,
							filename: disposition.parameters ? disposition.parameters.filename : null,
						},
					};
				},
			};
		});
});
let permissao = new PermissaoServiceApi(config);
let perfil = new PerfilServiceApi(config);

export function setAuthentication(token) {
	config.apiKey = token;
}

export {
	produto as ProdutoAPI,
	usuario as UsuarioAPI,
	unidade as UnidadeAPI,
	concorrente as ConcorrenteAPI,
	fornecedor as FornecedorAPI,
	pesquisa as PesquisaAPI,
	tipoPesquisa as TipoPesquisaAPI,
	modeloPrecificacao as ModeloPrecificacaoAPI,
	curva as CurvaAPI,
	categoria as CategoriaAPI,
	departamento as DepartamentoAPI,
	acaoVenda as AcaoVendaAPI,
	fluxo as FluxoAPI,
	gestaoCategoria as GestaoCategoriaAPI,
	adquirido as AdquiridoAPI,
	analytics as AnalyticsAPI,
	relatorio as RelatorioAPI,
	entidade as EntidadeAPI,
	permissao as PermissaoAPI,
  perfil as PerfilServiceApi,
	integracao as IntegracaoServiceAPI,

	ProdutoUnidadeCampoAdicionalTipo,
	FornecedorTipoInscricao,
	AuthenticateUsuarioRequestGrantType,
	PesquisaEtapa,
	TipoPrecificacao,
	AcaoVendaStatus,
	FluxoOrigem,
	FluxoStatus,
	GestaoCategoriaRankingCurva,
	GerarGraficoAnalisePerformanceRequestTipo,
	ListProdutosAdquiridosSituacao,
	AcaoVendaModelo,
	InicializarPrecosRequestModo,
	MovimentoTipo,
	GerarRelatorioPrecificacaoRequestModo,
	InicializarPrecosAcaoVendaRequestAcao,
	GestaoCategoriaCategoriaStatsStatus,

	defaultProcessCatch, filterErrors, Errors,
}

export function movimentoTipoText(tipo) {
	switch (tipo || MovimentoTipo.UNKNOWN) {
		case MovimentoTipo.ENTRADAAQUISICAO:
			return 'Entrada Aquisição';
		case MovimentoTipo.ENTRADABONIFICACAORECEBIDA:
			return 'Entrada Bonificação Recebida';
		case MovimentoTipo.ENTRADADEVOLUCAOVENDA:
			return 'Entrada Devolução Venda';
		case MovimentoTipo.ENTRADATRANSFERENCIA:
			return 'Entrada Transferência';
		default:
			return '- inválido -';
	}
}

export function fluxoOrigemText(origem) {
	switch (origem) {
		case FluxoOrigem.PESQUISA:
			return 'Competitividade';
		case FluxoOrigem.ACAOVENDA:
			return 'Ação de Vendas';
		case FluxoOrigem.GESTAOCATEGORIA:
		case FluxoOrigem.GESTAOCATEGORIACATEGORIA:
			return 'Gestão de Categoria';
		case FluxoOrigem.AQUISICAO:
			return 'Precificação';
		default:
			return '- inválido -';
	}
}

export function fluxoStatusText(status) {
	switch (status) {
		case FluxoStatus.PENDENTE:
			return 'Pendente';
		case FluxoStatus.APROVADO:
			return 'Aprovado';
		case FluxoStatus.RECUSADO:
			return 'Recusado';
		case FluxoStatus.SINCRONIZADO:
			return 'Aprovado & Sincronizado';
		default:
			return '- inválido -';
	}
}

export function pesquisaEtapaText(etapa = PesquisaEtapa.INICIAL) {
	switch (etapa) {
		case PesquisaEtapa.PESQUISA:
			return 'Pesquisa';
		case PesquisaEtapa.ANALISE:
			return 'Análise';
		default:
			return '- inválido -';
	}
}

export function tipoPrecificacaoText(tipo = TipoPrecificacao.UNSPECIFIED) {
	switch (tipo) {
		case TipoPrecificacao.MAIORPRECO:
			return 'Maior Preço';
		case TipoPrecificacao.MENORPRECO:
			return 'Menor Preço';
		case TipoPrecificacao.MARGEMCADASTRADA:
			return 'Margem Cadastrada';
		case TipoPrecificacao.MARGEMMINIMA:
			return 'Margem Mínima';
		default:
			return '- inválido -';
	}
}

export function acaoVendaStatusText(s) {
	s = s || AcaoVendaStatus.AGUARDANDO;
	switch (s) {
		case AcaoVendaStatus.AGUARDANDO:
			return 'Aguardando aprovação';
		case AcaoVendaStatus.FINALIZADA:
			return 'Aguardando aprovação';
		case AcaoVendaStatus.APROVADO:
			return 'Aprovado';
		case AcaoVendaStatus.RECUSADO:
			return 'Recusado';
		default:
			return '- inválido -';
	}
}

export function gestaoCategoriaRankingCurvaFormatoText(f) {
	f = f || GestaoCategoriaRankingCurva.UNSPECIFIED;
	switch (f) {
		case GestaoCategoriaRankingCurva.VENDA:
			return 'ABCDE de Venda';
		case GestaoCategoriaRankingCurva.LUCRO:
			return 'ABCDE de Lucro';
		default:
			return '- inválido -';
	}
}

export function listProdutosAdquiridosSituacaoText(s) {
	s = s || ListProdutosAdquiridosSituacao.NAOPRECIFICADOSHOJE;
	switch (s) {
		case ListProdutosAdquiridosSituacao.NAOPRECIFICADOSHOJE:
			return 'Não precificado hoje';
		case ListProdutosAdquiridosSituacao.NAOPRECIFICADOSPERIODO:
			return 'Não precificado no período';
		case ListProdutosAdquiridosSituacao.PRECIFICADOSHOJE:
			return 'Precificado hoje';
		case ListProdutosAdquiridosSituacao.PRECIFICADOSPERIODO:
			return 'Precificado no período';
		default:
			return '- Inválido -';
	}
}

export function acaoVendaModeloText(m) {
	switch (m || AcaoVendaModelo.INDEFINIDO) {
		case AcaoVendaModelo.ACAO:
			return 'Ação de Venda';
		case AcaoVendaModelo.COMBATE:
			return 'Combate';
		case AcaoVendaModelo.RECUPERACAO:
			return 'Recuperação';
		default:
			return '- indefinido -';
	}
}

export function gestaoCategoriaStatusCategoria(status) {
	switch (status || GestaoCategoriaCategoriaStatsStatus.StatusUNKNOWN) {
		case GestaoCategoriaCategoriaStatsStatus.NAOINICIADO:
			return ['#e53935', 'Não Executado'];
		case GestaoCategoriaCategoriaStatsStatus.INICIADO:
			return ['#d0ac0d', 'Em Execução'];
		case GestaoCategoriaCategoriaStatsStatus.FINALIZADO:
			return ['#43a047', 'Executado'];
		default:
			return ['#000', '- inválido -'];
	}
}

export function downloadBlob({ blob, disposition: { type = 'inline', filename } }) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');

	a.style.display = 'none';
	a.target = '_blank';
	a.href = url;
	if (type === 'attachment') {
		a.download = filename;
	}
	document.body.appendChild(a);
	a.click();

	setTimeout(() => {
		document.body.removeChild(a);
		a.remove();
		URL.revokeObjectURL(url);
	}, 150);
}
