import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles,
	Container, TableContainer,
} from '@material-ui/core';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import Page from '../../../components/Page';

import { defaultProcessCatch, PermissaoAPI } from '../../../services/api/index';

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

const Lista = () => {
	const classes = useStyles();
	const [permissoes, setPermissoes] = useState([]);
  const [countPermissoes, setCountPermissoes] = useState(0);
  const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	useEffect(() => {
    PermissaoAPI.list(page.page, page.perPage)
			.then(rs => {
        setPermissoes(rs.permissoes || []);
        setCountPermissoes(rs.total_count || 0);
      })
			.catch(defaultProcessCatch());
  }, [page.page, page.perPage]);

	return (
		<Page title="Permissões - Gestão de Usuários" className={classes.root} >
			<Container maxWidth={false} >
				<TableContainer component={Paper}>
					<TableSort rows={permissoes} count={countPermissoes} page={page} onChangePagination={setPage}>
						<TableSortColumn field="permissao" title="Permissão" />
					</TableSort>
				</TableContainer>
			</Container>
		</Page>
	);
}

export default Lista;
