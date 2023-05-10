import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import {
	Container, Grid, Divider,
	Card, CardHeader, CardContent,
	MenuItem, Button, CardActions, Typography,
} from '@material-ui/core';

import Page from '../../components/Page';
import { TextField, DateRangePicker, RadioGroup, RadioGroupOption, CircularProgressWithLabel } from '../../components/material';
import {
	defaultProcessCatch,
	filterErrors,
	AcaoVendaAPI,
	AcaoVendaStatus,
	CurvaAPI,
	AcaoVendaModelo,
	acaoVendaModeloText,
	Errors,
	InicializarPrecosAcaoVendaRequestAcao,
	FluxoAPI
} from '../../services/api';

import PesquisaProdutosDialog from '../produtos/PesquisaDialog';
import { numberFormat, DECIMAIS } from '../../utils/formats/number';
import alerts from '../../utils/alerts';

import DialogInicializaProdutos from './components/DialogProdutos';
import DialogSugestaoPrecoMargem from './components/DialogSugestaoPrecoMargem';
import DialogList from '../../components/material/DialogList';
import { Autocomplete } from '@material-ui/lab';

import ListaProdutos from './components/ListaProdutos';
import SearchAcaoField from '../analise-performance-acao/SearchAcaoField';
import ListaProdutosCombate from './components/ListaProdutosCombate';
import { showLoading } from '../../utils/loading';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

const Cadastro = () => {
	const { uuid } = useParams();
	const isAlteracao = !!uuid;
  const { permissoes } = useContext(LoggedContext);

	const navigate = useNavigate();
	const [produtos, setProdutos] = useState([]);
	const [valoresProdutos, setValoresProdutos] = useState({});
	const [modeloAcao, setModeloAcao] = useState();
	const [fluxo, setFluxo] = useState();
	const [form, setForm] = useState({
		nome: '',
		tipo_acao: '',
		status: 1,
		validade_inicio: moment().add(1, 'day').format('YYYY-MM-DD'),
		validade_fim: moment().add(8, 'day').format('YYYY-MM-DD'),
		unidades: [],
		acoes: [],
	});
	const [errors, setErrors] = useState(new Errors());
	const [tipos, setTipos] = useState([]);
	const [tipo, setTipo] = useState(null);
	const [dialogs, setDialogs] = useState(null);
	const [curvas, setCurvas] = useState([]);
	const [projecao, setProjecao] = useState();

	const changeField = values => setForm(v => ({ ...v, ...values }));

	const handleChangeAcoes = acoes => {
		let dates = [];
		let unidades = [];

		if (modeloAcao === AcaoVendaModelo.COMBATE) {
			acoes = acoes ? [acoes] : [];
		}
		for (const a of acoes || []) {
			dates.push(moment(a.validade_inicio), moment(a.validade_fim));
			for (const u of a.unidades || []) {
				if (unidades.filter(uu => uu.uuid === u.uuid).length === 0) {
					unidades.push(u);
				}
			}
		}

		const validade_inicio = dates.length
			? moment.min(dates).format('YYYY-MM-DD')
			: moment().add(1, 'day').format('YYYY-MM-DD');
		const validade_fim = dates.length
			? moment.max(dates).format('YYYY-MM-DD')
			: moment().add(8, 'day').format('YYYY-MM-DD');

		changeField({ acoes, unidades, validade_inicio, validade_fim });
		if (acoes.length) {
			setTipo(acoes[0].tipo);
		}
	}

	const handleChangeModelo = v => {
		if (!modeloAcao) {
			setModeloAcao(v);
			return;
		}
		alerts.confirmYesNo(
			'Alteração de modelo de ação',
			'Tem certeza de que você deseja alterar o modelo de ação? Isso irá reiniciar todas as informações definidas anteriormente.',
			{
				onYes: () => {
					setModeloAcao(v);
					setTipo(null);
					setProdutos([]);
					setValoresProdutos({});
					setErrors(new Errors());
					setForm({
						nome: '',
						tipo_acao: '',
						status: 1,
						validade_inicio: moment().add(1, 'day').format('YYYY-MM-DD'),
						validade_fim: moment().add(8, 'day').format('YYYY-MM-DD'),
						unidades: [],
						acoes: [],
					});
				}
			});
	}

	const reloadAcao = useCallback(() => {
		AcaoVendaAPI.getAcaoVenda(uuid)
			.then(rs => {
				setModeloAcao(rs.modelo);
				setFluxo(rs.fluxo);
				setForm({
					nome: rs.nome,
					tipo_acao: rs.tipo.uuid,
					status: rs.status || AcaoVendaStatus.AGUARDANDO,
					validade_inicio: rs.validade_inicio,
					validade_fim: rs.validade_fim,
					unidades: rs.unidades,
					acoes:
						rs.combate && rs.combate.acao
							? [rs.combate.acao]
							: rs.recuperacao
								? rs.recuperacao.acoes || []
								: [],
				});
				setTipo({
					...rs.tipo,
					unidades: rs.unidades || [],
				});

				setProdutos(rs.produtos.map(p => {
					let rs = { ...p.produto };
					if (p.referencia) {
						rs.original = { produto: p.referencia };
					}
					return rs;
				}));
				setValoresProdutos(rs.produtos.reduce((state, p) => ({
					...state,
					[p.produto.uuid]: {
						preco_acao: p.preco_acao,
						margem_acao: p.margem_acao,
						lucro_acao: p.lucro_acao,
					},
				}), {}));
			})
			.catch(defaultProcessCatch());
	}, [uuid]);

	useEffect(() => {
		CurvaAPI.list()
			.then(rs => setCurvas(rs.curvas || []))
			.catch(defaultProcessCatch());

		AcaoVendaAPI.listTiposAcaoVenda()
			.then(rs => setTipos(rs.tipos || []))
			.catch(defaultProcessCatch());
	}, []);

	useEffect(() => {
		if (!uuid) return;
		reloadAcao();
	}, [uuid, reloadAcao]);

	const buildCreateAcaoRequest = () => {
		let request = {
			uuid,
			nome: form.nome,
			validade_inicio: form.validade_inicio,
			validade_fim: form.validade_fim,
		};
		switch (modeloAcao) {
			case AcaoVendaModelo.ACAO:
				request.acao = {
					tipo: { uuid: form.tipo_acao },
					unidades: form.unidades.map(u => ({ uuid: u.uuid })),
					produtos: produtos.map(p => ({
						produto: { uuid: p.uuid },
						preco_acao: valoresProdutos[p.uuid] ? valoresProdutos[p.uuid].preco_acao : undefined,
					})),
				}
				break;
			case AcaoVendaModelo.COMBATE:
				request.combate = {
					acao: { uuid: form.acoes[0].uuid },
					produtos: produtos.map(p => ({
						produto: {
							produto: { uuid: p.uuid },
							preco_acao: valoresProdutos[p.uuid] ? valoresProdutos[p.uuid].preco_acao : undefined,
						},
						referencia: {
							produto: { uuid: p.original.produto.uuid }
						}
					}))
				}
				break;
			case AcaoVendaModelo.RECUPERACAO:
				request.recuperacao = {
					tipo: { uuid: form.tipo_acao },
					acoes: form.acoes.map(a => ({ uuid: a.uuid })),
					produtos: produtos.map(p => ({
						produto: { uuid: p.uuid },
						preco_acao: valoresProdutos[p.uuid] ? valoresProdutos[p.uuid].preco_acao : undefined,
					})),
				}
				break;
			default:
				alerts.snackbars.warning('Modelo de ação não selecionado!');
				break;
		}
		return request;
	}

	const calcularProjecaoLucro = () => {
		AcaoVendaAPI.projecaoLucros(buildCreateAcaoRequest())
			.then(rs => setProjecao(rs))
			.catch(defaultProcessCatch());
	}

	const submit = () => {
		alerts.confirmYesNo('Cadastro de ação de venda', 'Confirmar o cadastro desta ação?', {
			onYes: () => {
				AcaoVendaAPI.createAcaoVenda(buildCreateAcaoRequest())
					.then(rs => {
						alerts.snackbars.success('Ação cadastrada com sucesso');
						navigate(`../${rs.uuid}`);
					})
					.catch(defaultProcessCatch(errors => setErrors(errors)));
			},
		});
	}

	const changeTipoAcao = tipo => {
		const first = moment().add(1, 'day');
		const last = first.clone().add(tipo.quantidade_dias > 0 ? tipo.quantidade_dias - 1 : 0, 'days');
		changeField({
			tipo_acao: tipo.uuid,
			validade_inicio: first.format('YYYY-MM-DD'),
			validade_fim: last.format('YYYY-MM-DD'),
		});
		setTipo(tipo);
	}

	const limparProdutos = () => alerts.confirmYesNo(
		'Limpar produtos selecionados',
		'Limpar a lista de produtos selecionados?',
		{ onYes: () => setProdutos([]) })

	const handleChangeTipoAcao = tipo_acao => {
		for (const t of tipos) {
			if (t.uuid === tipo_acao) {
				changeTipoAcao(t);
			}
		}
	}

	const handleSelecaoProdutos = () => setDialogs(
		<PesquisaProdutosDialog
			multiple={false}
			onClose={produto => {
				if (produto) {
					if (!produtos.filter(p => p.uuid === produto.uuid).length) {
						setProdutos([produto, ...produtos]);
					}
				}
				// OLIVER
				setDialogs(null);

				if (uuid !== null && uuid !== undefined) {
					const existentProducts = produtos.map(p => ({ produto: p }))
					existentProducts.push({ produto })
					AcaoVendaAPI.updateAcaoVenda(uuid, {
						nome: form.nome,
						validade_inicio: form.validade_inicio,
						validade_fim: form.validade_fim,
						unidades: form.unidades,
						produtos: existentProducts
					})
						.then(() => console.log("atualizado"))
						.catch(defaultProcessCatch)
				}

			}} />
	)

	const handleInicializarProdutos = () => {
		if (!tipo) {
			alerts.snackbars.warning('Selecione um tipo de ação de vendas');
			return;
		}
		if (!form.unidades.length) {
			alerts.snackbars.warning('Selecione pelo menos uma unidade');
			return;
		}

		alerts.confirmYesNo(
			'Inicialização de produtos',
			<React.Fragment>
				A inicialização de produtos irá carregar os produtos por curva,
				baseado na configuração do tipo de ação.
				<br />
				<br />Confirmar inicialização? Os produtos já existentes serão removidos.
			</React.Fragment>,
			{
				onYes: () => setDialogs(
					<DialogInicializaProdutos
						tipo={tipo}
						modelo={modeloAcao}
						unidades={form.unidades}
						onClose={() => setDialogs(null)}
						onSelect={setProdutos} />
				),
			});
	}

	const handleInicializarPrecos = () => {
		if (!tipo) {
			alerts.snackbars.warning('Selecione um tipo de ação de vendas');
			return;
		}

		if (!produtos.length) {
			alerts.snackbars.warning('Nenhum produto adicionado para inicializar os preços');
			return;
		}

		AcaoVendaAPI.getTipoAcaoVenda(tipo.uuid)
			.then(({ margens_curvas }) => {
				let margens = [
					{ titulo: 'Limpar preços', value: InicializarPrecosAcaoVendaRequestAcao.LIMPAR },
					{ titulo: 'Mínimo', subtitulo: [], value: InicializarPrecosAcaoVendaRequestAcao.MINIMO },
					{ titulo: 'Média', subtitulo: [], value: InicializarPrecosAcaoVendaRequestAcao.MEDIO },
					{ titulo: 'Máximo', subtitulo: [], value: InicializarPrecosAcaoVendaRequestAcao.MAXIMO },
				];
				for (const curva in margens_curvas) {
					margens[1].subtitulo.push(`${curva}: ${numberFormat(margens_curvas[curva].minima, DECIMAIS.PERCENTUAL)}%`);
					margens[2].subtitulo.push(`${curva}: ${numberFormat(margens_curvas[curva].media, DECIMAIS.PERCENTUAL)}%`);
					margens[3].subtitulo.push(`${curva}: ${numberFormat(margens_curvas[curva].maxima, DECIMAIS.PERCENTUAL)}%`);
				}

				setDialogs(
					<DialogList
						title="Inicialização de preços"
						itens={margens}
						renderItemTitle={item => item.titulo}
						renderItemSubtitle={item => item.subtitulo ? `Curvas: ${item.subtitulo.join(' / ')}` : null}
						onClose={() => setDialogs(null)}
						onClick={item => {
							setDialogs();
							showLoading(
								'Inicializando preços',
								AcaoVendaAPI.inicializarPrecos(uuid, { acao: item.value })
									.then(() => {
										alerts.snackbars.success('Preços inicializados com sucesso');
										reloadAcao();
									})
									.catch(defaultProcessCatch()));
						}}
					/>
				);

			})
			.catch(defaultProcessCatch());
	}

	const handleSugestaoPrecoMargem = (produto, setValue) => {
		if (!tipo) {
			alerts.snackbars.warning('Selecione um tipo de ação de vendas');
			return;
		}

		// TODO: Temporário, deverá retornar a informação correta pela API
		produto.curvas.venda = produto.curvas.venda || 'A';
		if (produto.curvas.venda === '-') {
			produto.curvas.venda = 'A';
		}

		setDialogs(
			<DialogSugestaoPrecoMargem
				tipoAcao={tipo}
				produto={produto}
				onChangeValorProduto={(_, pv) => setValue(pv.preco_acao)}
				onClose={() => setDialogs(null)} />
		)
	}

	const renderOptionsModeloAcao = modeloAcao => {
		switch (modeloAcao) {
			case AcaoVendaModelo.ACAO:
				return (
					<React.Fragment>
						<Grid item xs={12} sm={6} md={3}>
							<TextField
								select
								disabled={isAlteracao}
								label="Tipo de ação"
								value={form.tipo_acao}
								onChange={handleChangeTipoAcao}
								errorText={filterErrors(errors, 'tipo_acao')}>
								{tipos.map((t, index) => (
									<MenuItem key={index} value={t.uuid}>{t.nome}</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid item xs={12} md={6}>
							<Autocomplete
								multiple
								limitTags={4}
								value={form.unidades}
								options={tipo ? tipo.unidades || [] : []}
								onChange={(_, unidades) => changeField({ unidades })}
								getOptionLabel={option => option.codigo}
								getOptionSelected={(opt, value) => opt.uuid === value.uuid}
								renderInput={(params) => (
									<TextField {...params} variant="outlined" label="Unidades" />
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={3}>
							<DateRangePicker
								format="DD/MM/YYYY"
								label="Validade"
								value={[form.validade_inicio, form.validade_fim]}
								onChange={datas => changeField({
									validade_inicio: datas[0],
									validade_fim: datas[1],
								})} />
						</Grid>
					</React.Fragment>
				);

			case AcaoVendaModelo.COMBATE:
				return (
					<React.Fragment>
						<Grid item xs={12} md={8}>
							<SearchAcaoField
								selectOne
								value={form.acoes.length ? form.acoes[0] : null}
								onChange={handleChangeAcoes}
								filtro={acao => acao.modelo === AcaoVendaModelo.ACAO}
								renderChipLabel={l => {
									const inicio = moment(l.validade_inicio).format('DD/MM/YYYY');
									const fim = moment(l.validade_fim).format('DD/MM/YYYY');
									return `${l.nome} (${inicio} até ${fim})`;
								}} />
						</Grid>

						<Grid item xs={12} md={4}>
							<DateRangePicker
								format="DD/MM/YYYY"
								label="Validade"
								value={[form.validade_inicio, form.validade_fim]}
								onChange={datas => changeField({
									validade_inicio: datas[0],
									validade_fim: datas[1],
								})} />
						</Grid>
					</React.Fragment>
				);

			case AcaoVendaModelo.RECUPERACAO:
				return (
					<React.Fragment>
						<Grid item xs={12} md={3}>
							<TextField
								select
								disabled={isAlteracao}
								label="Tipo de ação"
								value={form.tipo_acao}
								onChange={handleChangeTipoAcao}
								errorText={filterErrors(errors, 'tipo_acao')}>
								{tipos.map((t, index) => (
									<MenuItem key={index} value={t.uuid}>{t.nome}</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid item xs={12} md={6}>
							<SearchAcaoField
								value={form.acoes || []}
								onChange={handleChangeAcoes}
								filtro={acao => acao.modelo === AcaoVendaModelo.ACAO}
								renderChipLabel={l => {
									const inicio = moment(l.validade_inicio).format('DD/MM/YYYY');
									const fim = moment(l.validade_fim).format('DD/MM/YYYY');
									return `${l.nome} (${inicio} até ${fim})`;
								}} />
						</Grid>

						<Grid item xs={12} md={3}>
							<DateRangePicker
								format="DD/MM/YYYY"
								label="Validade"
								value={[form.validade_inicio, form.validade_fim]}
								onChange={datas => changeField({
									validade_inicio: datas[0],
									validade_fim: datas[1],
								})} />
						</Grid>
					</React.Fragment>
				);

			default:
				return (
					<Typography align="center" color="error" style={{ width: '100%' }}>
						Selecione um modelo de ação para prosseguir com o cadastro
					</Typography>
				);
		}
	}


	const [rowsCopy, setRowsCopy] = useState({})
	const handleSetRows = (value, v, b) => {
		const obj = {
				uuidProduto: b.uuid,
				original: v,
				edited: value,
				row: b
			}
		setRowsCopy(v => ({...v, [b.uuid]: obj}))
	}

	const UpdatePreco = async () => {
		for (let item of Object.values(rowsCopy)) {
			if (item.edited === item.unidade?.preco1.preco) {
				continue
			}

			item.row.unidade.preco1.valor = item.edited
			const unidadePrepared = [{
				unidade_uuid: item.row.unidade.unidade.uuid,
				update: item.row.unidade
			}]
			await FluxoAPI.updateProduto(
				fluxo.uuid || "-",
				item.uuidProduto,
				{
					origem: null,
					unidades: unidadePrepared,
					update_codigo_preco: false,
					update_mask:{ paths: ['ativo', 'bloqueado', 'oferta', 'preco1', 'preco2', 'preco3', 'preco4', 'preco5'] }
				}
			)
				.then(() => {
					alerts.snackbars.success('Alterações salvas com sucesso.');
				})
				.catch(defaultProcessCatch)

				// console.log(uuid)

				await AcaoVendaAPI.finalizarAcao(uuid)
				.then(() => {
					alerts.snackbars.success('Ação de venda finalizada');
				})
				.catch(defaultProcessCatch)

				reloadAcao()
		}
	}

	const renderListaProdutos = () => {
		switch (modeloAcao) {
			case AcaoVendaModelo.RECUPERACAO:
			case AcaoVendaModelo.ACAO:
				if (modeloAcao === AcaoVendaModelo.RECUPERACAO) {
					if (!form.acoes.length) {
						return (
							<Typography align="center" color="error" style={{ width: '100%' }}>
								Você deve selecionar pelo menos uma ação
							</Typography>
						);
					}
					if (!form.tipo_acao) {
						return (
							<Typography align="center" color="error" style={{ width: '100%' }}>
								Você deve selecionar um tipo de ação
							</Typography>
						);
					}
				}

				return (
					<ListaProdutos
						fluxo={fluxo}
						modelo={modeloAcao}
						errors={errors}
						setErrors={setErrors}
						handleSelecaoProdutos={handleSelecaoProdutos}
						handleInicializarProdutos={handleInicializarProdutos}
						handleInicializarPrecos={handleInicializarPrecos}
						handleSugestaoPrecoMargem={handleSugestaoPrecoMargem}
						setRowsCopy={handleSetRows}
						limparProdutos={limparProdutos}
						disabled={false}
						produtos={produtos}
						unidades={form.unidades}
						status={form.status}
						curvas={curvas}
						valores={valoresProdutos}
						onChangeProdutos={p => setProdutos(p)}
						onChangeValorProduto={(produto, pv) => setValoresProdutos(v => ({ ...v, [produto.uuid]: pv }))} />
				);

			case AcaoVendaModelo.COMBATE:
				if (!form.acoes.length) {
					return (
						<Typography align="center" color="error" style={{ width: '100%' }}>
							Você deve selecionar uma ação
						</Typography>
					);
				}

				return (
					<ListaProdutosCombate
						modelo={modeloAcao}
						fluxo={fluxo}
						errors={errors}
						setErrors={setErrors}
						acao={form.acoes[0]}
						handleSugestaoPrecoMargem={handleSugestaoPrecoMargem}
						disabled={false}
						produtosCombate={produtos}
						setProdutosCombate={setProdutos}
						valores={valoresProdutos}
						onChangeValorProduto={(produto, pv) => setValoresProdutos(v => ({ ...v, [produto.uuid]: pv }))} />
				);

			default:
				return null;
		}
	}

	return (
		<Page title="Ação de Vendas / Cadastro">
			<Container maxWidth={false} style={{ padding: 16 }}>
				<Grid container spacing={2}>
					<Grid item xs={12} md={12}>
						<Card>
							<CardHeader title="Cadastro de Ação de Vendas" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6} lg={5}>
										<TextField
											autoFocus
											label="Nome"
											value={form.nome}
											onChange={nome => changeField({ nome })}
											errorText={filterErrors(errors, 'nome')} />
									</Grid>
									<Grid item xs={12} md={6} lg={7}>
										<RadioGroup
											row
											label="Modelo"
											value={modeloAcao}
											onChange={handleChangeModelo}
											errorText={modeloAcao ? filterErrors(errors, 'modelo') : 'Selecione um modelo de ação'}>
											{
												userCan(permissoes, 'pricing - ação de vendas - gestão ação de vendas - ação de venda') ?
													<RadioGroupOption key={AcaoVendaModelo.ACAO} value={AcaoVendaModelo.ACAO}>
														{acaoVendaModeloText(AcaoVendaModelo.ACAO)}
													</RadioGroupOption> : null
											}
											{
												userCan(permissoes, 'pricing - ação de vendas - gestão ação de vendas - combate') ?
													<RadioGroupOption key={AcaoVendaModelo.COMBATE} value={AcaoVendaModelo.COMBATE}>
														{acaoVendaModeloText(AcaoVendaModelo.COMBATE)}
													</RadioGroupOption> : null
											}
											{
												userCan(permissoes, 'pricing - ação de vendas - gestão ação de vendas - recuperação') ?
													<RadioGroupOption key={AcaoVendaModelo.RECUPERACAO} value={AcaoVendaModelo.RECUPERACAO}>
														{acaoVendaModeloText(AcaoVendaModelo.RECUPERACAO)}
													</RadioGroupOption> : null
											}
										</RadioGroup>
									</Grid>

									{renderOptionsModeloAcao(modeloAcao)}
								</Grid>
							</CardContent>

							{renderListaProdutos()}

							<CardActions>
								{isAlteracao ? null : (
									<Button
										variant="outlined"
										color="primary"
										disabled={!modeloAcao}
										onClick={submit}>
										Cadastrar
									</Button>
								)}

								{!isAlteracao || form.status === 'FINALIZADA' ? null : <Button
									variant="outlined"
									color="primary"
									onClick={UpdatePreco}>
									Finalizar ação de venda
								</Button>}
								<Button
									color="secondary" variant="outlined"
									disabled={!produtos.length}
									onClick={calcularProjecaoLucro}>
									CALCULAR PROJEÇÃO
								</Button>
							</CardActions>
						</Card>
					</Grid>

					{projecao ? (
						<Grid item xs={12} md={12}>
							<Card>
								<CardHeader title="Projeção de Resultados" />
								<Divider />
								<CardContent>
									<Grid container spacing={2}>
										{projecao.acao ? <ProjecaoStat label="Ação" stats={projecao.acao} /> : null}
										{projecao.combate ? <ProjecaoStat label="Combate" stats={projecao.combate} /> : null}
										{projecao.recuperacao ? <ProjecaoStat label="Recuperação" stats={projecao.recuperacao} /> : null}
										{projecao.total ? <ProjecaoStat label="Total" stats={projecao.total} /> : null}
									</Grid>
								</CardContent>
							</Card>
						</Grid>
					) : null}
				</Grid>
			</Container>
			{dialogs}
		</Page>
	);
}

function ProjecaoStat({ label, stats }) {
	return (
		<Grid item xs={3} container spacing={2}>
			<Grid item xs={6} container spacing={2} direction="column">
				<Grid item style={{ textAlign: 'center' }}>
					{label}
				</Grid>
				<Grid item style={{ textAlign: 'center' }}>
					<CircularProgressWithLabel value={stats.percentual_lucro || 0} size={50} />
				</Grid>
			</Grid>
			<Grid item xs={6} container spacing={2} direction="column">
				<Grid item xs>
					<Typography>Venda Prevista:</Typography>
					<Divider />
					<Typography>R$ {numberFormat(stats.valor_venda, DECIMAIS.VALOR)}</Typography>
				</Grid>
				<Grid item xs>
					<Typography>Lucro Previsto:</Typography>
					<Divider />
					<Typography>R$ {numberFormat(stats.valor_lucro, DECIMAIS.VALOR)}</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
}

export default Cadastro;
