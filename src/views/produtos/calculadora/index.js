import React, { useState, useEffect, useRef } from 'react';
import {
	Box, Button, Dialog, DialogActions, DialogContent,
	DialogTitle, Grid, Typography, makeStyles, Collapse, MenuItem
} from '@material-ui/core';
import { numberFormat, DECIMAIS } from '../../../utils/formats/number';
import { defaultProcessCatch, FluxoAPI, ProdutoAPI } from '../../../services/api';
import Field from './components/Field';
import { TextField } from '../../../components/material'
import alerts from '../../../utils/alerts';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles(() => ({
	boxGridTitle: {
		display: 'inline-block',
		fontSize: '1.5rem',
		padding: '10px 17px',
		fontWeight: 800,
		textTransform: 'uppercase',
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
	},
	boxGridChildren: {
		padding: 15,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 10,
	},
	boxValueBox: {
		borderRadius: 8,
		padding: 10,
		flex: 1,
	},
}));

const BoxValue = ({ isEditable, backgroundColor, fontColor, title, spacing = 0, onChange = () => { }, size = 6, ...props }) => {
	const classes = useStyles();
	const boxInput = useRef();
	function handleFocus() {
		boxInput.current.focus();
	}
	return (
		<Grid item xs={size} >
			<div onClick={handleFocus}
				style={{
					backgroundColor: backgroundColor,
				}}
				className={classes.boxValueBox} >
				<Typography style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: spacing }} >{title}{isEditable ? ':' : ''}</Typography>
        <div style={{ color: fontColor, textAlign: 'right', borderBottom: isEditable ? '1px solid rgba(0, 0, 0, 0.87)' : '' }}>
				  <Field displayType={isEditable ? 'input' : 'text'} onChange={onChange} inputRef={boxInput} {...props} />
        </div>
			</div>
		</Grid>
	);
}

const BoxGrid = ({ backgroundColor, title, children, total, collapsed = true }) => {
	const classes = useStyles();
	return (
		<div>
			{!!title && <div
				style={{
					backgroundColor: backgroundColor,
					color: "#FFF",
				}}
				className={classes.boxGridTitle}
			>{title}</div>}
			<div
				style={{
					backgroundColor: backgroundColor,
					borderTopLeftRadius: !!title ? 0 : 10
				}}
				className={classes.boxGridChildren}
			>
				<Collapse in={collapsed} >
					<Grid container spacing={2} >{children}</Grid>
				</Collapse>
				{!!total && <Grid container style={{ marginTop: 15 }} >
					<BoxTotal total={total} color={backgroundColor} />
				</Grid>}
			</div>
		</div>
	);
}

const BoxTotal = ({ total, color }) => {
	return (
		<Grid item xs={12} >
			<div style={{ backgroundColor: "#FFF", borderRadius: 5, padding: 10 }} >
				<Grid container spacing={1} >
					<Grid item xs={6} >
						<Typography style={{ fontSize: '1.2rem', fontWeight: 600, color: color }} >TOTAL:</Typography>
					</Grid>
					<Grid item xs={6} style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 900 }}  >{total}</Grid>
				</Grid>
			</div>
		</Grid>
	);
}

let handleSearch;

const Calculadora = ({ produto, onClose }) => {
  const [produtosPesquisados, setProdutosPesquisados] = useState([]);
  const [produtoUUID, setProdutoUUID] = useState('');
	const [precoCompra, setPrecoCompra] = useState(0);
  const [precoCompraBase, setPrecoCompraBase] = useState(0);
  const [custoCompraBase, setCustoCompraBase] = useState(0);
	const [precoVenda, setPrecoVenda] = useState(0);
  const [custoVendaBase, setCustoVendaBase] = useState(0);
	const [precoVendaBase, setPrecoVendaBase] = useState(0);
  const [produtoCodigo, setProdutoCodigo] = useState('');
  const [produtoDescricao, setProdutoDescricao] = useState('');
  const [produtoUnidades, setProdutoUnidades] = useState([]);
  const [produtoUnidadeValue, setProdutoUnidadeValue] = useState('');
  const [produtoPrecoValue, setProdutoPrecoValue] = useState('');
  const [produtoPreco, setProdutoPreco] = useState([]);
  const [produtoMargem, setProdutoMargem] = useState(0);
  const [produtoMargemMinima, setProdutoMargemMinima] = useState(0);
  const [outrosAcrescimos, setOutrosAcrescimos] = useState(0);
  const [outrosDescontos, setOutrosDescontos] = useState(0);
	const [resultado, setResultado] = useState({
		custo_compra: 0.0,
		custo_venda: 0.0,
		custo_total: 0.0,
		lucro: {
			valor: 0.0,
			percentual: 0.0,
		},
	});

  const setProdutoData = p => {
    setProdutoUUID(p.uuid);
    setProdutoCodigo(p.codigo);
    setProdutoDescricao(p.descricao);
    setProdutoUnidadeValue(p.unidades[0].unidade.uuid);
    setCustoCompraBase(p.unidades[0].custo_compra ? p.unidades[0].custo_compra : 0)
    setCustoVendaBase(p.unidades[0].custos ? p.unidades[0].custos.venda : 0)
    setOutrosAcrescimos(p.unidades[0].outros_acrescimos ? p.unidades[0].outros_acrescimos : 0)
    setOutrosDescontos(p.unidades[0].outros_descontos ? p.unidades[0].outros_descontos : 0)
    setProdutoUnidades(p.unidades.map(u => (
      {
        uuid: u.unidade.uuid,
        nome: u.unidade.nome,
        preco1: u.preco1.preco ? u.preco1.preco : 0,
        preco2: u.preco2.preco ? u.preco2.preco : 0,
        preco3: u.preco3.preco ? u.preco3.preco : 0,
        preco4: u.preco4.preco ? u.preco4.preco : 0,
        preco5: u.preco5.preco ? u.preco5.preco : 0,
        precoCompra: u.preco_compra ? u.preco_compra : 0,
        precoCompraBase: u.preco_compra ? u.preco_compra : 0,
        custoCompraBase: u.custo_compra ? u.custo_compra : 0,
        custoVendaBase: u.custos ? u.custos.venda : 0,
        precoVenda: u.preco1.preco ? u.preco1.preco : 0,
        precoVendaBase: u.preco1.preco ? u.preco1.preco : 0,
        outrosAcrescimos: u.outros_acrescimos ? u.outros_acrescimos : 0,
        outrosDescontos: u.outros_descontos ? u.outros_descontos : 0,
      }
    )));
    const ppreco = []
    ppreco.push({label: 'preço 1', value: p.unidades[0].preco1.preco ? p.unidades[0].preco1.preco : 0})
    ppreco.push({label: 'preço 2', value: p.unidades[0].preco2.preco ? p.unidades[0].preco2.preco : 0})
    ppreco.push({label: 'preço 3', value: p.unidades[0].preco3.preco ? p.unidades[0].preco3.preco : 0})
    ppreco.push({label: 'preço 4', value: p.unidades[0].preco4.preco ? p.unidades[0].preco4.preco : 0})
    ppreco.push({label: 'preço 5', value: p.unidades[0].preco5.preco ? p.unidades[0].preco4.preco : 0})

    setProdutoPreco(ppreco);
    setProdutoPrecoValue(`${ppreco[0].label}-${ppreco[0].value}`);
    setProdutoMargem(p.unidades[0].preco1.margem);
    setProdutoMargemMinima(p.unidades[0].preco1.margem_minima);
    setPrecoCompra(p.unidades[0].preco_compra);
    setPrecoVenda(p.unidades[0].preco1.preco);
    setPrecoCompraBase(p.unidades[0].preco_compra);
    setPrecoVendaBase(p.unidades[0].preco1.preco);
  }

  const changeUnidade = uuid => {
    const u = produtoUnidades.find(u => u.uuid === uuid)
    const ppreco = []

    ppreco.push({label: 'preço 1', value: u.preco1})
    ppreco.push({label: 'preço 2', value: u.preco2})
    ppreco.push({label: 'preço 3', value: u.preco3})
    ppreco.push({label: 'preço 4', value: u.preco4})
    ppreco.push({label: 'preço 5', value: u.preco5})

    setProdutoPreco(ppreco);
    setProdutoPrecoValue(`${ppreco[0].label}-${ppreco[0].value}`);
    setProdutoUnidadeValue(uuid);
    setPrecoCompra(u.precoCompra);
    setPrecoVenda(u.precoVenda);
    setOutrosDescontos(u.outrosDescontos);
    setOutrosAcrescimos(u.outrosAcrescimos);
    setCustoCompraBase(u.custoCompraBase);
    setCustoVendaBase(u.custoVendaBase);
    setPrecoCompraBase(u.precoCompraBase);
    setPrecoVendaBase(u.precoVendaBase);
  }

  const atualizarPrecoProduto = () => {
    const alteracoes = {
      unidade_uuid: produtoUnidadeValue,
      update: {}
    }

    const preco1 = produtoPreco.find(p => p.label === 'preço 1').value
    const preco2 = produtoPreco.find(p => p.label === 'preço 2').value
    const preco3 = produtoPreco.find(p => p.label === 'preço 3').value
    const preco4 = produtoPreco.find(p => p.label === 'preço 4').value
    const preco5 = produtoPreco.find(p => p.label === 'preço 5').value

    alteracoes.update.preco1 = {valor: preco1}
    alteracoes.update.preco2 = {valor: preco2}
    alteracoes.update.preco3 = {valor: preco3}
    alteracoes.update.preco4 = {valor: preco4}
    alteracoes.update.preco5 = {valor: preco5}

    const label = produtoPrecoValue.split('-')[0]

    if (label === 'preço 1') {
      alteracoes.update.preco1.valor = precoVenda
      alteracoes.update.preco1.margem = produtoMargem
      alteracoes.update.preco1.margem_minima = produtoMargemMinima
    } else if (label === 'preço 2') {
      alteracoes.update.preco2.valor = precoVenda
      alteracoes.update.preco2.margem = produtoMargem
      alteracoes.update.preco2.margem_minima = produtoMargemMinima
    } else if (label === 'preço 3') {
      alteracoes.update.preco3.valor = precoVenda
      alteracoes.update.preco3.margem = produtoMargem
      alteracoes.update.preco3.margem_minima = produtoMargemMinima
    } else if (label === 'preço 4') {
      alteracoes.update.preco4.valor = precoVenda
      alteracoes.update.preco4.margem = produtoMargem
      alteracoes.update.preco4.margem_minima = produtoMargemMinima
    } else if (label === 'preço 5') {
      alteracoes.update.preco5.valor = precoVenda
      alteracoes.update.preco5.margem = produtoMargem
      alteracoes.update.preco5.margem_minima = produtoMargemMinima
    }

    FluxoAPI.updateProduto(
		  '-',
		  produto ? produto.uuid : produtoUUID,
      {
        origem: "AQUISICAO",
        unidades: [alteracoes],
        update_codigo_preco: false,
        update_mask: { paths: ['preco1', 'preco2', 'preco3', 'preco4', 'preco5'] }
      })
      .then(() => {
        alerts.snackbars.success('Alterações salvas com sucesso.');
      })
      .catch(defaultProcessCatch());
  }

  /* eslint-disable */
  useEffect(() => {
    if (produto)
      setProdutoData(produto)
  }, [])

	useEffect(() => {
    ProdutoAPI.calcularCustos(
      {
        preco_compra_base: precoCompraBase,
        preco_venda_base: precoVendaBase,
        preco_compra_novo: precoCompra,
        preco_venda_novo: precoVenda,
        custo_venda_base: custoVendaBase,
        custo_compra_base: custoCompraBase,
        outros_descontos: outrosDescontos,
        outros_acrescimos: outrosAcrescimos
      })
      .then(rs => setResultado({
        custo_compra: rs.custo_compra === "NaN" ? 0 : rs.custo_compra,
        custo_venda: rs.custo_venda === "NaN" ? 0 : rs.custo_venda,
        custo_total: rs.custo_total === "NaN" ? 0 : rs.custo_total,
        lucro: {
          valor: rs.lucro.valor === "NaN" ? 0 : rs.lucro.valor,
          percentual: rs.lucro.percentual === "NaN" ? 0 : rs.lucro.percentual
        }
      }))
      .catch(defaultProcessCatch());
	}, [precoCompra, precoVenda]);

  useEffect(() => {
		clearTimeout(handleSearch);
		handleSearch = setTimeout(() => {
			ProdutoAPI.search(
				{
					page_number: 1,
					page_size: 10,
					filtros: {
						codigo: produtoCodigo,
						descricao: produtoDescricao,
					},
				})
				.then(rs => {
					setProdutosPesquisados(rs.produtos || []);
				})
				.catch(defaultProcessCatch());
		}, 500);
	}, [produtoCodigo, produtoDescricao]);

	return (
		<React.Fragment>
      <Dialog maxWidth='lg' fullWidth open={true} >
        <DialogTitle disableTypography >
          <Grid container>
            <Grid item xs={6} >
              <Typography variant="h6" >Calculadora de Custos</Typography>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} >
            <Grid item xs={3} >
              <Typography variant="h6" gutterBottom>Produto</Typography>
              {produto ? <>
                <Typography variant="subtitle1">Código:</Typography>
                <Typography variant="h6" gutterBottom>{produtoCodigo}</Typography>
                </> : <Autocomplete
                  clearOnBlur={false}
                  disableClearable
                  noOptionsText=""
                  inputValue={produtoCodigo}
                  options={produtosPesquisados}
                  onInputChange={v => setProdutoCodigo(v.target.value)}
                  onChange={(_, p) => setProdutoData(p)}
                  getOptionLabel={option => option.codigo}
                  getOptionSelected={(opt, value) => opt.codigo === value.codigo}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Código" />
                  )}
              />
             }
             {produto ? <>
                <Typography variant="subtitle1">Descrição:</Typography>
                <Typography variant="h6" gutterBottom>{produtoDescricao}</Typography>
                </> : <Autocomplete
                  clearOnBlur={false}
                  disableClearable
                  noOptionsText=""
                  inputValue={produtoDescricao}
                  options={produtosPesquisados}
                  onInputChange={v => setProdutoDescricao(v.target.value)}
                  onChange={(_, p) => setProdutoData(p)}
                  getOptionLabel={option => option.descricao}
                  getOptionSelected={(opt, value) => opt.descricao === value.descricao}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Descrição" />
                  )}
              />
             } 
              {produto ? null : 
                <TextField
                  select
                  label="unidade"
                  value={produtoUnidadeValue}
                  onChange={val => changeUnidade(val)}
                >
                  {produtoUnidades.map(u => (
                    <MenuItem key={u.uuid} value={u.uuid}>{u.nome}</MenuItem>
                  ))}
                </TextField>
              }
              <TextField
                select
                label="preco"
                value={produtoPrecoValue}
                onChange={val => {
                  setProdutoPrecoValue(val);
                  setPrecoVenda(parseFloat(val.split('-')[1]));
                }}
              >
                {produtoPreco.map(p => (
                  <MenuItem key={p.label} value={`${p.label}-${p.value}`}>{`${p.label} - R$ ${p.value.toFixed(3)}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={9} >
              <Grid container spacing={2} >
                <Grid item xs={12} >
                  <BoxGrid backgroundColor="#e6e7e8" >
                    <BoxValue title="Preço Compra"
                      backgroundColor="#f0f8ff"
                      spacing={20}
                      onChange={v => setPrecoCompra(v)}
                      value={precoCompra}
                      prefix="R$ "
                      isPrice
                      size={3}
                      isEditable
                    />
                    <BoxValue title="Custo Compra"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={resultado.custo_compra}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                    <BoxValue title="Custo Venda"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={resultado.custo_venda}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                    <BoxValue title="Custo Total"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={resultado.custo_total}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                    <BoxValue title="Preço Venda"
                      backgroundColor="#f0f8ff"
                      spacing={20}
                      onChange={v => setPrecoVenda(v)}
                      value={precoVenda}
                      prefix="R$ "
                      isPrice
                      size={3}
                      isEditable
                    />
                    <BoxValue title="% Lucro"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={numberFormat((()=>{
                        if (!resultado.lucro.percentual) {
                          return 0
                        } else if (resultado.lucro.percentual === "-Infinity") {
                          return -99.99
                        } else if (resultado.lucro.percentual === "NaN") {
                          return 0
                        } else {
                          return resultado.lucro.percentual.toFixed(3)
                        }
                      })(), DECIMAIS.PERCENTUAL)}
                      suffix="%"
                      size={3}
                    />
                    <BoxValue title="Lucro"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={resultado.lucro.valor}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                    <BoxValue title="Margem Mínima"
                      backgroundColor="#f0f8ff"
                      spacing={20}
                      value={produtoMargemMinima}
                      suffix="%"
                      size={3}
                      onChange={v => setProdutoMargemMinima(v)}
                      isEditable
                    />
                    <BoxValue title="Margem Ideal"
                      backgroundColor="#f0f8ff"
                      spacing={20}
                      value={produtoMargem}
                      suffix="%"
                      size={3}
                      onChange={v => setProdutoMargem(v)}
                      isEditable
                    />
                    <BoxValue title="Outros Acréscimos"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={outrosAcrescimos}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                    <BoxValue title="Outros Descontos"
                      backgroundColor="#ffffff"
                      spacing={20}
                      value={outrosDescontos}
                      prefix="R$ "
                      isPrice
                      size={3}
                    />
                  </BoxGrid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary" variant="contained"
            onClick={atualizarPrecoProduto}
          >
            Atualizar Produto
          </Button>
          <Box flex={1} />
          <Button onClick={() => {
            setPrecoCompra(0);
            setPrecoVenda(0);
            if (!produto) {
              setProdutoCodigo('');
              setProdutoDescricao('');
              setProdutoUnidades([]);
              setProdutoUnidadeValue('');
              setProdutoPrecoValue('');
              setProdutoPreco([]);
              setProdutoMargem(0);
              setProdutoMargemMinima(0);
            } else
              setProdutoData(produto)
          }} >
            Limpar
          </Button>
          <Button onClick={onClose} >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
		</React.Fragment>
	);
}


export default Calculadora;
