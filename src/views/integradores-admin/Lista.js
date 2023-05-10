import { Container, TableContainer, Paper, IconButton } from "@material-ui/core";
import { CheckCircle, Close } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TableSort, TableSortColumn } from "../../components/material/TableSort";
import Page from "../../components/Page";

import { defaultProcessCatch, IntegracaoServiceAPI } from '../../services/api';
import { VisualizarIcon } from "../../theme/icones";

//const useStyles = makeStyles((theme) => ({}))

const IntegradoresList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [integradores, setIntegradores] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState({
	  perPage: 10,
	  page: 1,
  })

  useEffect(() => {
    if (id) {
		const idInt = parseInt(id)
      IntegracaoServiceAPI.historicIntegrator(idInt, page.page, page.perPage)
      .then(rs => {
		  setIntegradores(rs.historico || [])
		  setCount(rs.total_count || 0)
	  })
      .catch(defaultProcessCatch)
    } else {
      IntegracaoServiceAPI.listLastStatusIntegrators()
      .then(rs => setIntegradores(rs.integrators || []))
      .catch(defaultProcessCatch)
    }
  }, [id, page.page, page.perPage])

  return (
    <Page title="Integradores">
      <Container>
        <TableContainer component={Paper}>
          <TableSort rows={integradores} count={count} page={page} onChangePagination={setPage}>
            <TableSortColumn field="nome" title="Nome" width={150}/>
            <TableSortColumn field="status" title="Status" width={150} formatter={(_, integ) => {
            if (integ.status === 1) return<div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'}}>
                Ativo <CheckCircle style={{color: 'green'}}/>
              </div>
              return <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'}}>
                Inativo <Close style={{color: 'red'}}/>
              </div>
            }}/>
            <TableSortColumn field="last_update" title="Última atualização" width={200} formatter={(_, inte) => {
              return <p>{new Date(inte.last_update.split('Z')[0]).toLocaleString('pt-br')}</p>
            }}/>
            {!id ?
            <TableSortColumn field="id" width={60} padding="none" formatter={(_, integrador) => {
              if (!id) {
                return (
                  <IconButton onClick={() => navigate(`${integrador.id}`)}>
                    <VisualizarIcon />
                  </IconButton>
                )
              }
              return null
            }}/>: null }
          </TableSort>
        </TableContainer>
      </Container>
    </Page>
  )
}

export default IntegradoresList;
