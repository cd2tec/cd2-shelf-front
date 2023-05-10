import React, { useState, useEffect, useCallback, useContext } from 'react';
import moment from 'moment';

import {
	Paper, makeStyles,
	Container,
	TableContainer,
	Grid,
	IconButton,
	Fab,
	Card,
	CardContent,
	CardActions,
	Button,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Edit as EditIcon, Search as SearchIcon } from '@material-ui/icons';

import Page from '../../../components/Page';
import {
	UnidadeAPI, AdquiridoAPI,
	ListProdutosAdquiridosSituacao,
	defaultProcessCatch,
	FluxoOrigem,
	MovimentoTipo,
	DepartamentoAPI,
	CategoriaAPI,
	GerarRelatorioPrecificacaoRequestModo,
	movimentoTipoText,
} from '../../../services/api';
import { DateRangePicker, RadioGroup, RadioGroupOption, TextField } from '../../../components/material';
import { showLoading } from '../../../utils/loading';
import { DECIMAIS, numberFormat } from '../../../utils/formats';
import PesquisaProdutosDialog from '../../produtos/PesquisaDialog';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import EdicaoPrecoDialog from '../../produtos/EdicaoPrecoDialog/EdicaoPrecoDialog';
import LoggedContext from '../../../context/LoggedContext';
import { userCan } from '../../../utils/validation';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(11),
		paddingTop: theme.spacing(3)
	},
	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

const Precificacao = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [unidades, setUnidades] = useState([]);
	const [departamentos, setDepartamentos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [filtro, setFiltro] = useState({
		modo: GerarRelatorioPrecificacaoRequestModo.UNDEFINED,
		documentos: [],
		unidades: [],
		departamentos: [],
		categorias: [],
		marca: '',
		periodo: ['2021-01-01', moment().format('YYYY-MM-DD')],
		situacao: ListProdutosAdquiridosSituacao.NAOPRECIFICADOSHOJE,
	});
	const [registros, setRegistros] = useState([]);
	const [modoRegistros, setModoRegistros] = useState(GerarRelatorioPrecificacaoRequestModo.UNDEFINED);
	const [countRegistros, setCountRegistros] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});
	const [dialog, setDialog] = useState();

	const onChangePage = page => {
		setPage(page);
		gerar(page);
	};

	useEffect(() => {
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
		DepartamentoAPI.search("", true)
			.then(rs => setDepartamentos(rs.departamentos || []))
			.catch(defaultProcessCatch());
	}, []);

	useEffect(() => {
		CategoriaAPI.search({
			filtros: {
				departamentos_uuid: filtro.departamentos.map(d => d.uuid)
			}
		})
			.then(rs => setCategorias(rs.categorias || []))
			.catch(defaultProcessCatch());
	}, [filtro.departamentos])

	const gerar = useCallback(customPage => {
		if (filtro.modo === GerarRelatorioPrecificacaoRequestModo.UNDEFINED) return;

		showLoading(
			'Carregando lista de adquiridos...',
			AdquiridoAPI.gerarRelatorioPrecificacao(
				{
					modo: filtro.modo,
					page_number: (customPage || page).page,
					page_size: (customPage || page).perPage,

					entradas_documentos: (filtro.documentos || []).map(d => d.value),
					entradas_periodo: {
						inicio: filtro.periodo[0],
						fim: filtro.periodo[1],
					},
					unidades: (filtro.unidades || []).map(u => u.uuid),
					departamentos: (filtro.departamentos || []).map(d => d.uuid),
					categorias: (filtro.categorias || []).map(c => c.uuid),
					marca: filtro.marca,
				})
				.then(rs => {
					setModoRegistros(rs.modo);
					setCountRegistros(rs.total_count || 0);
					setRegistros((rs.modo === GerarRelatorioPrecificacaoRequestModo.ENTRADAS ? rs.movimentos : rs.produtos) || []);
				})
				.catch(defaultProcessCatch())
		);
	}, [filtro, page]);

	const onChangeFiltro = v => setFiltro(state => ({ ...state, ...v }))

	const openProduto = produto => setDialog(
		<EdicaoPrecoDialog
			produtoUUID={produto.uuid}
			fluxoOrigem={FluxoOrigem.AQUISICAO}
			onClose={() => setDialog()} />
	)

	const openPesquisaProduto = () => setDialog(
		<PesquisaProdutosDialog
			multiple={false}
			onClose={produto => {
				setDialog(null);
				if (produto) openProduto(produto);
			}} />
	)

	const renderColumnsRegistros = () => {
		switch (modoRegistros) {
			case GerarRelatorioPrecificacaoRequestModo.ENTRADAS:
				return (
					<TableSort rows={registros || []} size="small" page={page} onChangePagination={onChangePage} count={countRegistros}>
						<TableSortColumn field="movimento.unidade.codigo" title="Unidade" />
						<TableSortColumn field="movimento.produto.codigo" title="Produto" />
						<TableSortColumn field="movimento.produto.descricao" title="Descrição" />
						<TableSortColumn field="movimento.produto.marca" title="Marca" />
						<TableSortColumn field="movimento.produto.complemento" title="Complemento" />
						<TableSortColumn field="movimento.produto.departamento.nome" title="Departamento" />
						<TableSortColumn field="movimento.produto.categoria.nome" title="Categoria" />
						<TableSortColumn field="movimento.tipo" title="Movimento"
							formatter={tipo => movimentoTipoText(tipo)}
						/>
						<TableSortColumn field="movimento.data" title="Data"
							formatter={data => moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY')}
						/>
						<TableSortColumn field="movimento.quantidade" title="Quantidade" align="right"
							formatter={quantidade => numberFormat(quantidade, DECIMAIS.QUANTIDADES)}
						/>
						<TableSortColumn field="movimento.valor" title="Valor" align="right"
							formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`}
						/>
						<TableSortColumn field="valor_unitario" title="Valor Unitário" align="right"
							formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`}
						/>
						<TableSortColumn field="margem_atual" title="Margem Atual" align="right"
							formatter={valor => `${numberFormat(valor, DECIMAIS.MARGEM_LUCRO)}%`}
						/>
						<TableSortColumn disabled={true} width={50}
							formatter={(_, p) => (
								<IconButton size="small" onClick={() => openProduto(p.movimento.produto)}>
									<EditIcon />
								</IconButton>
							)}
						/>
					</TableSort>
				);

			case GerarRelatorioPrecificacaoRequestModo.CADASTROPRODUTOS:
				return (
					<TableSort rows={registros || []} size="small" page={page} onChangePagination={onChangePage} count={countRegistros}>
						<TableSortColumn field="unidade.codigo" title="Unidade" />
						<TableSortColumn field="produto.codigo" title="Código" />
						<TableSortColumn field="produto.descricao" title="Descrição" />
						<TableSortColumn field="produto.marca" title="Marca" />
						<TableSortColumn field="produto.complemento" title="Complemento" />
						<TableSortColumn field="produto.departamento.nome" title="Departamento" />
						<TableSortColumn field="produto.categoria.nome" title="Categoria" />
						<TableSortColumn field="preco_compra" title="Preço de Compra"
							formatter={valor => `R$ ${numberFormat(valor, DECIMAIS.VALOR_COMPRA)}`}
						/>
						<TableSortColumn disabled={true} width={50}
							formatter={(_, p) => (
								<IconButton size="small" onClick={() => openProduto(p.produto)}>
									<EditIcon />
								</IconButton>
							)}
						/>
					</TableSort>
				);

			default:
				return null;
		}
	}

	return (
		<Page title="Pricing - Fluxos" className={classes.root}>
      {userCan(permissoes, 'pricing - precificação - gerar precificação') ?
        <Container maxWidth={false}>
          <Card>
            <CardContent>
              <Grid container>
                <Grid item xs={4} md={3}>
                  <RadioGroup
                    label="Precificar"
                    value={filtro.modo}
                    onChange={modo => onChangeFiltro({ modo })}>
                    <RadioGroupOption value={GerarRelatorioPrecificacaoRequestModo.ENTRADAS}>
                      Aquisições / Movimentações
                    </RadioGroupOption>
                    <RadioGroupOption value={GerarRelatorioPrecificacaoRequestModo.CADASTROPRODUTOS}>
                      Cadastro de Produtos
                    </RadioGroupOption>
                  </RadioGroup>
                </Grid>
                <Grid item xs={8} md={9} container spacing={1}>
                  {filtro.modo === GerarRelatorioPrecificacaoRequestModo.ENTRADAS ? (
                    <React.Fragment>
                      <Grid item xs={12} md={9}>
                        <Autocomplete
                          multiple
                          limitTags={4}
                          value={filtro.documentos}
                          options={[
                            { value: MovimentoTipo.ENTRADAAQUISICAO, label: 'Entrada por Aquisição' },
                            { value: MovimentoTipo.ENTRADABONIFICACAORECEBIDA, label: 'Entrada por Bonificação Recebida' },
                            { value: MovimentoTipo.ENTRADATRANSFERENCIA, label: 'Entrada por Transferência' }
                          ]}
                          onChange={(_, documentos) => onChangeFiltro({ documentos })}
                          getOptionLabel={option => option.label}
                          getOptionSelected={(opt, value) => opt.value === value.value}
                          renderInput={(params) => (
                            <TextField {...params} variant="outlined" label="Documentos" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4} md={3}>
                        <DateRangePicker
                          format="DD/MM/YYYY"
                          label="Período de Aquisição"
                          value={filtro.periodo}
                          onChange={periodo => onChangeFiltro({ periodo })} />
                      </Grid>
                    </React.Fragment>
                  ) : null}

                  <Grid item xs={6}>
                    <Autocomplete
                      multiple
                      value={filtro.unidades}
                      options={unidades}
                      onChange={(_, unidades) => onChangeFiltro({ unidades })}
                      getOptionLabel={option => option.nome}
                      renderOption={option => `${option.codigo} - ${option.codigo}`}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      autoHighlight={true}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Unidades" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete
                      multiple
                      value={filtro.departamentos}
                      options={departamentos}
                      onChange={(_, departamentos) => onChangeFiltro({ departamentos })}
                      getOptionLabel={option => option.nome}
                      renderOption={option => `${option.codigo} - ${option.nome}`}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      autoHighlight={true}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Departamentos" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete
                      multiple
                      value={filtro.categorias}
                      options={categorias}
                      onChange={(_, categorias) => onChangeFiltro({ categorias })}
                      getOptionLabel={option => option.nome}
                      renderOption={option => `${option.codigo} - ${option.nome}`}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      autoHighlight={true}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Categorias" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Marca"
                      value={filtro.marca}
                      onChange={marca => onChangeFiltro({ marca })} />
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>

            <CardActions>
              <Button
                style={{ marginLeft: 'auto' }}
                variant="outlined"
                color="primary"
                onClick={() => onChangePage({ ...page, page: 1 })}>
                Gerar
              </Button>
            </CardActions>
          </Card>

          <TableContainer component={Paper} style={{ marginTop: 16 }}>
            {renderColumnsRegistros()}
          </TableContainer>
        </Container> : null
      }
			
			{dialog}

      {userCan(permissoes, 'pricing - precificação - editar produto') ?
        <Fab color="primary" className={classes.fab} onClick={openPesquisaProduto}>
				  <SearchIcon />
			  </Fab> : null
      }
		</Page>
	);
}

export default Precificacao;
