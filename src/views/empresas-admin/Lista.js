import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Fab, makeStyles, Container, TableContainer, Paper, IconButton } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { VisualizarIcon } from '../../theme/icones';

import Page from '../../components/Page';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';

import { defaultProcessCatch, EntidadeAPI } from '../../services/api/index';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

const EmpresasAdminLista = () => {
  const classes = useStyles();
  const [entidades, setEntidades] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

  useEffect(() => {
    EntidadeAPI.list(page.page, page.perPage)
			.then(rs => {
        setEntidades(rs.entidades || []);
        setCount(rs.total_count || 0);
      })
			.catch(defaultProcessCatch());
  }, [page.page, page.perPage]);

  return (
    <Page title="Empresas" className={classes.root}>
      <Container maxWidth={false} >
				<TableContainer component={Paper}>
					<TableSort rows={entidades} count={count} page={page} onChangePagination={setPage}>
						<TableSortColumn field="nome" title="Nome" />
            <TableSortColumn field="uuid" title="" width={60} padding="none"
                formatter={
                  uuid => <IconButton component={Link} to={uuid + '/produtos' || ''}>
                    <VisualizarIcon />
                  </IconButton>
                } disabled={true} />
					</TableSort>
				</TableContainer>
			</Container>
      <Fab color="primary" component={Link} to={"novo"} className={classes.fab}>
				<AddIcon />
			</Fab>
    </Page>
  );
}

export default EmpresasAdminLista;
