import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import {
	Paper, makeStyles, Container,
	TableContainer, IconButton,
} from '@material-ui/core';

import Page from '../../components/Page';
import { ProdutoAPI, defaultProcessCatch } from '../../services/api';
import { VisualizarIcon } from '../../theme/icones';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation'

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

const Produtos = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [produtos, setProdutos] = useState([]);
	const [countProdutos, setCountProdutos] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
		ProdutoAPI.list(page.page, page.perPage)
			.then(rs => {
				setProdutos(rs.produtos || []);
				setCountProdutos(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [page.page, page.perPage]);

	return (
		<Page title="Produtos" className={classes.root}>
      {userCan(permissoes, 'cadastros - visualizar produtos') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={produtos} count={countProdutos} page={page} onChangePagination={setPage} >
              <TableSortColumn field="codigo" title="Código" width={130} />
              <TableSortColumn field="codigo_barra" title="Código Barra" width={150} />
              <TableSortColumn field="descricao" title="Descrição" />
              <TableSortColumn field="marca" title="Marca" />
              <TableSortColumn field="complemento" title="Complemento" />
              <TableSortColumn field="departamento.nome" title="Departamento" />
              <TableSortColumn field="categoria.nome" title="Categoria" />
              <TableSortColumn field="uuid" title="" width={60} padding="none"
                formatter={
                  uuid => <IconButton component={Link} to={uuid || ''}>
                    <VisualizarIcon />
                  </IconButton>
                } disabled={true} />
            </TableSort>
          </TableContainer>
			  </Container> : null
      }
		</Page>
	)
}

export default Produtos;
