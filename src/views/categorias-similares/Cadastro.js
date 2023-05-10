import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Grid, makeStyles, Card, CardHeader,
  Divider, CardContent, CardActions, Button, Checkbox
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import SearchIcon from '@material-ui/icons/Search';

import { TextField } from '../../components/material'

import Page from '../../components/Page';
import { CategoriaAPI, defaultProcessCatch, DepartamentoAPI, UnidadeAPI } from '../../services/api';
import alerts from '../../utils/alerts';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  actions: {
    padding: 15,
    justifyContent: "space-between"
  }
}));

let handleSearch

const Cadastro = () => {
  const { id } = useParams();

  const [uuid, setUuid] = useState('');
  const classes = useStyles();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [similares, setSimilares] = useState([]);
  const [similaresValue, setSimilaresValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriasPesquisadas, setCategoriasPesquisadas] = useState([]);
  const [categoriaCodigo, setCategoriaCodigo] = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentosValue, setDepartamentosValue] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadesValue, setUnidadesValue] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [children, setChildren] = useState(false);

  useEffect(() => {
    if (id) {
      setUuid(id)
      setDisabled(true)
    }
  }, [id])

  useEffect(() => {
    let unidadesUUID
    if (unidadesValue) {
      unidadesUUID = unidades.filter(unit => unit.nome === unidadesValue).map(u => u.uuid)
    }

    let departamentosUUID
    if (departamentosValue) {
      departamentosUUID = departamentos.filter(depto => depto.nome === departamentosValue).map(d => d.uuid)
    }
    
    CategoriaAPI.search({
      filtros: {
        unidades_uuid: unidadesUUID,
        departamentos_uuid: departamentosUUID
      }
    })
      .then(rs => {
        setSimilares(rs.categorias || []);
      })
      .catch(defaultProcessCatch());

      UnidadeAPI.list()
        .then(rs => setUnidades(rs.unidades || []))
        .catch(defaultProcessCatch)
  }, [departamentos, departamentosValue, unidadesValue, unidades]);

  useEffect(() => {
    if (uuid) {
      CategoriaAPI.getSimilares(uuid)
        .then(rs => {
          setNome(rs.categoria.nome);
          setClassificacao(rs.categoria.classificacao);
          setCategoriaCodigo(rs.categoria.codigo);
          setSimilaresValue(rs.similares || []);
        })
        .catch(defaultProcessCatch());
    }
  }, [uuid]);

  useEffect(() => {
    clearTimeout(handleSearch);
    const page = { size: 10, number: 1 }
    if (categoriaCodigo !== "" || nome !== "") {
      page.size = 100
    }
    let unidadesUUID
    if (unidadesValue) {
      unidadesUUID = unidades.filter(unit => unit.nome === unidadesValue).map(u => u.uuid)
    }

    let departamentosUUID
    if (departamentosValue) {
      departamentosUUID = departamentos.filter(depto => depto.nome === departamentosValue).map(d => d.uuid)
    }

    handleSearch = setTimeout(() => {
      CategoriaAPI.search(
        {
          page_number: page.number,
          page_size: page.size,
          filtros: {
            codigo: categoriaCodigo,
            nome: nome,
            unidades_uuid: unidadesUUID,
            departamentos_uuid: departamentosUUID,
          },
        })
        .then(rs => {
          setCategoriasPesquisadas(rs.categorias || []);
        })
        .catch(defaultProcessCatch());
    }, 500);
  }, [categoriaCodigo, nome, unidadesValue, departamentosValue, departamentos, unidades]);

  useEffect(() => {
    DepartamentoAPI.search("",true)
    .then(rs => setDepartamentos(rs.departamentos || []))
    .catch(defaultProcessCatch)
  }, [unidadesValue])

  const submit = () => {
    if (!uuid) return
    if (loading) return

    setLoading(true);
    CategoriaAPI.updateSimilares(uuid, {
      similares_uuid: similaresValue.map(s => s.uuid),
      children: children
    })
      .then(_ => {
        alerts.snackbars.success('Categoria adicionada com sucesso');
        navigate('/app/categorias-similares');
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(defaultProcessCatch());
  }

  const limpar = () => {
    setUuid("");
    setNome("");
    setClassificacao("");
    setCategoriaCodigo("");
    setSimilaresValue([]);
    setUnidadesValue("")
    setDepartamentosValue("")
  }

  const setProdutoData = p => {
    setCategoriaCodigo(p.codigo)
    setClassificacao(p.classificacao)
    setNome(p.nome)
    setUuid(p.uuid)
  }

  return (
    <Page title="Categorias Similares / atualizar similares" className={classes.root}>
      <Container maxWidth={false} style={{ marginTop: 20 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Atualizar similares da categoria" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth={true}
                      clearOnBlur={false}
                      disableClearable
                      inputValue={unidadesValue}
                      options={unidades}
                      onInputChange={(_, v) => setUnidadesValue(v)}
                      getOptionLabel={option => option.codigo}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Unidades" />
                      )} />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth={true}
                      clearOnBlur={false}
                      disableClearable
                      inputValue={departamentosValue}
                      options={departamentos}
                      onInputChange={(_, v) => setDepartamentosValue(v)}
                      getOptionLabel={option => option.nome}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Departamentos" />
                      )} />
                  </Grid>

                  <Grid item xs={3}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <SearchIcon style={{ marginRight: 15, marginTop: 5 }} />
                      <Autocomplete
                        disabled={disabled}
                        fullWidth={true}
                        clearOnBlur={false}
                        disableClearable
                        noOptionsText=""
                        inputValue={categoriaCodigo}
                        options={categoriasPesquisadas}
                        onInputChange={v => {
                          setClassificacao("")
                          setNome("")
                          setSimilaresValue([])
                          // setDepartamentosValue("")
                          // setUnidadesValue("")
                          setCategoriaCodigo(v.target.value)
                        }}
                        onChange={(_, p) => setProdutoData(p)}
                        getOptionLabel={option => option.codigo}
                        getOptionSelected={(opt, value) => opt.codigo === value.codigo}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" label="Código" />
                        )} />
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth={true}
                      clearOnBlur={false}
                      disableClearable
                      noOptionsText=""
                      inputValue={classificacao}
                      options={categoriasPesquisadas}
                      onInputChange={(_, v) => {
                        setCategoriaCodigo("")
                        setNome("")
                        setSimilaresValue([])
                        // setDepartamentosValue("")
                        // setUnidadesValue("")
                        setClassificacao(v)
                      }}
                      onChange={(_, p) => setProdutoData(p)}
                      getOptionLabel={option => option.classificacao}
                      getOptionSelected={(opt, value) => opt.classificacao === value.classificacao}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Classificação" />
                      )} />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth={true}
                      clearOnBlur={false}
                      disableClearable
                      noOptionsText=""
                      inputValue={nome}
                      options={categoriasPesquisadas}
                      onInputChange={(_, v) => {
                        setCategoriaCodigo("")
                        setClassificacao("")
                        setSimilaresValue([])
                        // setDepartamentosValue("")
                        // setUnidadesValue("")
                        setNome(v)
                      }}
                      onChange={(_, p) => setProdutoData(p)}
                      getOptionLabel={option => `${option.nome} (${option.classificacao})`}
                      getOptionSelected={(opt, value) => opt.nome === value.nome}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Nome" />
                      )} />
                  </Grid>

                  <Divider />
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      limitTags={4}
                      value={similaresValue}
                      options={similares}
                      onChange={(_, similares) => setSimilaresValue(similares)}
                      getOptionLabel={option => `${option.nome} (${option.classificacao})`}
                      getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Similares" />
                      )}
                    />
                    <div style={{display: 'flex', alignItens: 'center'}}>
                      <Checkbox
                        checked={children}
                        onChange={e => setChildren(e.target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                      <p style={{marginTop: '10px'}}>Incluir categorias subjacentes</p>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <CardActions className={classes.actions}>
                <Button disabled={loading} variant="contained" color="primary" onClick={submit}>Cadastrar</Button>
                <Button disabled={loading} onClick={limpar}>Limpar</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
};

export default Cadastro;
