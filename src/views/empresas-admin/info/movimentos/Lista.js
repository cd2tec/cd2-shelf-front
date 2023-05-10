import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer, IconButton, Grid, Button, CircularProgress
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { ProdutoAPI, defaultProcessCatch } from '../../../../services/api';

import { TableSort, TableSortColumn } from '../../../../components/material/TableSort';
import { VisualizarIcon } from '../../../../theme/icones';
import { useNavigate } from 'react-router-dom';
import { Autocomplete } from '@material-ui/lab';
import { DateRangePicker, TextField } from '../../../../components/material';
import moment from 'moment';
import { DECIMAIS, numberFormat } from '../../../../utils/formats';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  actions: {
    textAlign: 'right',
  }
}));

const Movimentos = ({ uuid }) => {
  const classes = useStyles();
  const navigate = useNavigate()
  const [movimentos, setMovimentos] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState({
    perPage: 10,
    page: 1,
  });
  const [filtro, setFiltro] = useState({
    unidades: [],
    tipo: [],
    data_inicio: moment().add(1, 'day').format('YYYY-MM-DD'),
    data_fim: moment().add(-5, 'day').format('YYYY-MM-DD')
  })
  const [unidades, setUnidades] = useState([])
  const [tipo, setTipo] = useState([])
  const [loading, setLoading] = useState(true)

  const changeField = values => setFiltro(v => ({ ...v, ...values }));

  /* eslint-disable */
  useEffect(async () => {
		setLoading(true)
    const unidadesUUID = filtro.unidades.map(u => u.uuid)
		ProdutoAPI.movimentosAdminResume(
			page.page,
			page.perPage,
			uuid,
			unidadesUUID,
			filtro.tipo,
			filtro.data_inicio,
			filtro.data_fim)
			.then(rs => {
				setMovimentos(rs.movimentos || [])
				setCount(rs.total_count || 0)
				if (unidades.length === 0) {
					const units = rs.movimentos.map(m => m.unidade)
					const unitsFiltered = units.reduce((acc, curr) => {
						if (!acc.find(el => el.nome === curr.nome)) {
							acc.push({ ...curr })
						}
						return acc
					}, [])
					setUnidades([...unitsFiltered])
				}
				if (tipo.length === 0) {
					setTipo([...new Set(rs.movimentos.map(m => m.tipo === 'UNKNOWN' ? 'INDEFINIDO' : m.tipo))])
				}
			})
			.catch(defaultProcessCatch)
			.finally(() => setLoading(false))

  }, [uuid, page.page, page.perPage, filtro]);

  const goToDetails = (row) => {
    navigate('detalhes', { replace: true, state: { data: row, uuid: uuid } })
  }

  return (
    <Page title="Movimentos" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <Grid container spacing={2} style={{ marginLeft: '15px', marginBottom: '-55px' }}>
            <Grid item xs={5}>
              <Autocomplete
                multiple={true}
                clearOnBlur={false}
                options={unidades}
                value={filtro.unidades}
                onChange={(_, v) => changeField({ unidades: v })}
                getOptionSelected={(opt, val) => opt.uuid === val.uuid}
                getOptionLabel={opt => opt.nome}
                renderInput={(params) => (
                  <TextField {...params} variant={'outlined'} label={'Filtrar por unidade'} />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                multiple={true}
                clearOnBlur={false}
                options={tipo}
                value={filtro.tipo}
                onChange={(_, v) => changeField({ tipo: v })}
                getOptionSelected={(opt, val) => opt === val}
                renderInput={(params) => (
                  <TextField {...params} variant={'outlined'} label={'Filtrar por tipo'} />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ marginLeft: '15px', marginBottom: '-55px', marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Grid item xs={9} style={{marginLeft: '7px'}}>
                <DateRangePicker
                  format="DD/MM/YYYY"
                  label="Data"
                  value={[filtro.data_inicio, filtro.data_fim]}
                  onChange={datas => changeField({
                    data_inicio: datas[0],
                    data_fim: datas[1],
                  })} />
              </Grid>
              {/*<Grid item xs={3} color='primary' style={{marginLeft: '20px'}}>*/}
              {/*  <Button variant='contained' color='primary' style={{borderRadius: '5px'}}>filtrar</Button>*/}
              {/*</Grid>*/}
              <Grid item xs={3} style={{marginLeft: '20px'}}>
                <Button
                  size='small'
                  variant='text'
                  onClick={() => changeField({
                    unidades: [],
                    tipo: [],
                    data_inicio: moment().add(1, 'day').format('YYYY-MM-DD'),
                    data_fim: moment().add(-180, 'day').format('YYYY-MM-DD')
                  })}
                >limpar</Button>
              </Grid>
            </div>
          </Grid>
			{ loading ? <div style={{margin: '100px 0 40px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
				<CircularProgress variant="indeterminate"/>
			</div> : null}
			{ !loading && movimentos.length === 0 ? <div style={{margin: '100px 0 40px', padding: '0 25px'}}>Sem resultados</div> : null}
			{ !loading && movimentos.length ?
          <TableSort rows={movimentos} count={count} page={page} onChangePagination={setPage} >
            <TableSortColumn field="unidade.nome" title="Unidade" />
            {/* <TableSortColumn field="produto.descricao" title="Produto" /> */}
            <TableSortColumn field="tipo" title="Tipo" formatter={v => v === 'UNKNOWN' ? 'INDEFINIDO' : v} />
            <TableSortColumn field="quantidade" title="Quantidade" formatter={v => numberFormat(v, DECIMAIS.VALOR)}/>
            {/* <TableSortColumn field="custo_medio" title="Custo Médio" /> */}
            <TableSortColumn field="valor" title="Valor" formatter={v => `R$ ${numberFormat(v, DECIMAIS.QUANTIDADES)}`}/>
            <TableSortColumn field="data_cadastro" title="Data" />
            <TableSortColumn
              field="unidade"
              formatter={
                (_, v) => {
                  return (
                    <IconButton onClick={() => goToDetails(v)}>
                      <VisualizarIcon />
                    </IconButton>
                  )
                }
              }
            />
          </TableSort> : null }
        </TableContainer>
      </Container>
    </Page>
  )
}

export default Movimentos;
