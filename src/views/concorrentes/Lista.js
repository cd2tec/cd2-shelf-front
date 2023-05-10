import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";

import {
	Paper, makeStyles,
	Container, TableContainer, IconButton,
} from '@material-ui/core';

import Page from '../../components/Page';
import { ConcorrenteAPI, defaultProcessCatch } from '../../services/api';
import { VisualizarIcon } from '../../theme/icones';
import { formatCPFOrCNPJ } from '../../utils/formats';
import { TableSort, TableSortColumn } from '../../components/material/TableSort';
import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

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

const Lista = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [concorrentes, setConcorrentes] = useState([]);
	const [countConcorrentes, setCountConcorrentes] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	const onChangePage = page => setPage(page);

	useEffect(() => {
		ConcorrenteAPI.list(page.page, page.perPage)
			.then(rs => {
				setConcorrentes(rs.concorrentes || []);
				setCountConcorrentes(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [page.page, page.perPage]);

	return (
		<Page title="Fornecedores" className={classes.root}>
      {userCan(permissoes, 'cadastros - visualizar concorrentes') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={concorrentes} page={page} onChangePagination={onChangePage} count={countConcorrentes} >
              <TableSortColumn field="numero_inscricao" title="Número Inscrição" width={180}
                formatter={v => formatCPFOrCNPJ(v)}
              />
              <TableSortColumn field="nome" title="Nome" />
              <TableSortColumn field="razao_social" title="Razão Social" />
              <TableSortColumn field="uuid" title="" padding="none" width={60}
                disabled={true}
                formatter={uuid => <IconButton component={Link} to={uuid || ''}>
                  <VisualizarIcon />
                </IconButton>}
              />
            </TableSort>
          </TableContainer>
			  </Container> : null
      }
		</Page>
	)
}

export default Lista;
