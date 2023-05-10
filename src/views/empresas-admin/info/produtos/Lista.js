import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { ProdutoAPI, defaultProcessCatch } from '../../../../services/api';

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

const Produtos = ({uuid}) => {
	const classes = useStyles();
	const [produtos, setProdutos] = useState([]);
	const [countProdutos, setCountProdutos] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
		ProdutoAPI.listAdmin(page.page, page.perPage, uuid)
			.then(rs => {
				setProdutos(rs.produtos || []);
				setCountProdutos(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [uuid, page.page, page.perPage]);

	return (
		<Page title="Produtos" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <TableSort rows={produtos} count={countProdutos} page={page} onChangePagination={setPage} >
            <TableSortColumn field="codigo" title="Código" width={130} />
            <TableSortColumn field="codigo_barra" title="Código Barra" width={150} />
            <TableSortColumn field="descricao" title="Descrição" />
            <TableSortColumn field="marca" title="Marca" />
            <TableSortColumn field="complemento" title="Complemento" />
          </TableSort>
        </TableContainer>
      </Container>
		</Page>
	)
}

export default Produtos;
