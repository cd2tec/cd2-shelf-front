import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer
} from '@material-ui/core';

import Page from '../../../../components/Page';
import { UnidadeAPI, defaultProcessCatch } from '../../../../services/api';

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

const Unidades = ({uuid}) => {
	const classes = useStyles();
	const [unidades, setUnidades] = useState([]);
	const [countUnidades, setCountUnidades] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
		UnidadeAPI.listAdmin(page.page, page.perPage, uuid)
			.then(rs => {
				setUnidades(rs.unidades || []);
				setCountUnidades(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [uuid, page.page, page.perPage]);

	return (
		<Page title="Unidades" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <TableSort rows={unidades} count={countUnidades} page={page} onChangePagination={setPage} >
            <TableSortColumn field="cnpj" title="CNPJ" width={150} />
            <TableSortColumn field="nome" title="Nome" />
          </TableSort>
        </TableContainer>
      </Container>
		</Page>
	)
}

export default Unidades;
