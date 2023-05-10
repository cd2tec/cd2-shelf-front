import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { FornecedorAPI, defaultProcessCatch } from '../../../../services/api';

import { TableSort, TableSortColumn } from '../../../../components/material/TableSort';


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

const Fornecedores = ({uuid}) => {
	const classes = useStyles();
	const [fornecedores, setFornecedores] = useState([]);
	const [countFornecedores, setCountFornecedores] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
	  FornecedorAPI.listAdmin(page.page, page.perPage, uuid)
			.then(rs => {
				setFornecedores(rs.fornecedores || []);
				setCountFornecedores(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [uuid, page.page, page.perPage]);

	return (
		<Page title="Fornecedores" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <TableSort rows={fornecedores} count={countFornecedores} page={page} onChangePagination={setPage} >
            <TableSortColumn field="codigo" title="Código" width={130} />
            <TableSortColumn field="numero_inscricao" title="Número Inscrição" width={150} />
            <TableSortColumn field="nome" title="Nome" />
            <TableSortColumn field="razao_social" title="Razão Social" />
          </TableSort>
        </TableContainer>
      </Container>
		</Page>
	)
}

export default Fornecedores;
