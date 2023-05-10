import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { ProdutoAPI, defaultProcessCatch } from '../../../../services/api';

import { TableSort, TableSortColumn } from '../../../../components/material/TableSort';
import { useLocation } from 'react-router-dom';
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

const MovimentosDetalhes = () => {
	const classes = useStyles();
  const { state } = useLocation()
	const [movimentos, setMovimentos] = useState([]);
	const [count, setCount] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
		const date = state.data.data_cadastro.split("T")[0]
		ProdutoAPI.movimentosAdminResumeDetails(
			page.page,
			page.perPage,
			state.uuid,
			state.data.unidade.uuid,
			state.data.tipo,
			date,
			date)
			.then(rs => {
				setMovimentos(rs.movimentos || [])
				setCount(rs.total_count || 0)
			})
			.catch(defaultProcessCatch)
	}, [page.page, page.perPage, state]);

	return (
		<Page title="Detalhes movimentos" className={classes.root}>
      <Container maxWidth={false}>
			<TableContainer component={Paper}>
          <TableSort rows={movimentos} count={count} page={page} onChangePagination={setPage} >
            <TableSortColumn field="unidade.nome" title="Unidade" />
            <TableSortColumn field="produto.descricao" title="Produto" />
            <TableSortColumn field="tipo" title="Tipo" formatter={v => v === 'UNKNOWN' ? 'INDEFINIDO': v}/>
            <TableSortColumn field="quantidade" title="Quantidade" formatter={v => numberFormat(v, DECIMAIS.VALOR)}/>
            {/* <TableSortColumn field="custo_medio" title="Custo Médio" /> */}
            <TableSortColumn field="valor" title="Valor" formatter={v => `R$ ${numberFormat(v, DECIMAIS.QUANTIDADES)}`}/>
            <TableSortColumn field="data_cadastro" title="Data" />
          </TableSort>
        </TableContainer>
      </Container>
		</Page>
	)
}

export default MovimentosDetalhes;
