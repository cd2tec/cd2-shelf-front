import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from "react-router-dom";
import {
	Paper, makeStyles,
	Container, TableContainer,
  Fab, Grid, Button, IconButton
} from '@material-ui/core';

import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';
import { TextField } from '../../components/material';
import Page from '../../components/Page';

import { defaultProcessCatch, CategoriaAPI } from '../../services/api/index';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';
import { Autocomplete } from '@material-ui/lab';
import alerts from '../../utils/alerts';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		textAlign: 'right',
	},
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

const optionsFilter = [
    {
      label: 'Nome',
      field: 'nome'
    },
    {
      label: 'Código',
      field: 'codigo'
    },
    {
      label: 'Classificação',
      field: 'classificacao'
    }
  ]


let handleSearch;
const Lista = () => {
  const navigate = useNavigate()
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [categorias, setCategorias] = useState([]);
  const [countSimilares, setCountSimilares] = useState(0);
  const [page, setPage] = useState({
		perPage: 0,
		page: 1,
	});
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState(''); 

  useEffect(() => {
    clearTimeout(handleSearch)
    handleSearch = setTimeout(() => {
      const apiFiltro = {
        nome: "",
        codigo: "",
        classificacao: ""
      }
  
      if (busca && filtro) {
        const [{ field }] = optionsFilter.filter(op => op.label === filtro)
        apiFiltro[field] = busca
      }
  
  
      CategoriaAPI.searchSimilares(apiFiltro.nome, apiFiltro.classificacao, apiFiltro.codigo)
      .then(rs => {
        const c = rs.categorias || []
        setCategorias(c.map(cat => ({...cat.categoria, similares: cat.similares})))
        setCountSimilares(rs.total_count || 0)
      })
      .catch(defaultProcessCatch)
    }, 500)
  }, [filtro, busca])

	useEffect(() => {
    CategoriaAPI.listSimilares(page.page, page.perPage)
			.then(rs => {
        const c = rs.categorias || []
        setCategorias(c.map(cat => ({...cat.categoria, similares: cat.similares})))
        setCountSimilares(rs.total_count || 0)
      })
			.catch(defaultProcessCatch());
  }, [page.page, page.perPage])

  const syncSimilares = () => {
    CategoriaAPI.listSimilares(page.page, page.perPage)
			.then(rs => {
        const c = rs.categorias || []
        setCategorias(c.map(cat => ({...cat.categoria, similares: cat.similares})))
        setCountSimilares(rs.total_count || 0)
      })
			.catch(defaultProcessCatch());
  }

  const removerSimilar = (row) => {
    alerts.confirmYesNo(
      'Remover Similar',
      `Remover ${row.nome}?`,
      {
        onYes: () => {
          // TODO: esperando make api
          CategoriaAPI.removeSimilar(row.uuid, {
            categoria_uuid: row.uuid,
            categorias_similares_uuid: row.similares.map(s => s.uuid)
          })
            .then(_ => {
              syncSimilares();
              alerts.snackbars.success('Similar removido com sucesso');
            })
            .catch(defaultProcessCatch());
        }
      }
    );
  }

	return (
		<Page title="Categorias Similares" className={classes.root} >
      {userCan(permissoes, 'configurações - categorias similares - visualizar categorias similares') ?
        <Container maxWidth={false} >
          <TableContainer component={Paper}>
            <Grid container spacing={2} style={{marginLeft: '15px', marginBottom: '-55px'}}>
              <Grid item xs={2}>
                <Autocomplete
                  clearOnBlur={false}
                  inputValue={filtro}
                  onInputChange={(_, v) => setFiltro(v)}
                  options={optionsFilter}
                  getOptionLabel={opt => opt.label}
                  getOptionSelected={(opt, val) => opt.field === val.field}
                  renderInput={(params) => (
                    <TextField {...params} variant={'outlined'}  label={'Filtrar por ...'}/>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <TextField
                    placeholder={'Busca...'}
                    value={busca}
                    onChange={setBusca}
                  />
                  {/* <Button
                    onClick={handleFilterTable}
                    style={{
                      borderRadius: '5px',
                      padding: '10px 30px',
                      margin: '5px 0 0 10px'
                    }}
                    variant='contained'
                    startIcon={<SearchIcon />}
                  >Buscar</Button> */}
                  <Button
                    disabled={!filtro && !busca}
                    size={'small'}
                    variant={'text'}
                    style={{margin: '5px 0 0 10px'}}
                    onClick={() => {
                      setFiltro('')
                      setBusca('')
                    }}
                    >limpar</Button>
                </div>
              </Grid>
            </Grid>
            <TableSort rows={categorias} count={countSimilares} page={page} onChangePagination={setPage}>
              <TableSortColumn field="codigo" title="Código" width={100}/>
              <TableSortColumn field="classificacao" title="Classificação" width={120}/>
              <TableSortColumn field="nome" title="Nome" width={200}/>
              <TableSortColumn field="similares" title="Similares" width={200} formatter={(_, cat) => {
                let similares = ''
                if (cat.similares)
                  cat.similares.map(c => {
                    if (similares === '')
                      similares += c.nome
                    else
                      similares += `, ${c.nome}`
                    return null
                  })
                return <div>{similares}</div>
              }} />
              <TableSortColumn field="uuid" width="60px" padding="none" formatter={(_, row) => {
                return (
                  <>
                  <div style={{display: 'flex'}}>
                    <IconButton onClick={() => navigate(`atualizar/${row.uuid}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => removerSimilar(row)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                  </>
                )
              }
              }/>
            </TableSort>
          </TableContainer>
        </Container> : null
    }
    {userCan(permissoes, 'configurações - categorias similares - editar similares') ?
      <Fab color="primary" component={Link} to={"/app/categorias-similares/atualizar"} className={classes.fab}>
        <AddIcon />
      </Fab> : null
    }
	  </Page>
	);
}

export default Lista;
