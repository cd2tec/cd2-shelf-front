import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Fab, makeStyles, Container, TableContainer, Paper, IconButton } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';

import Page from '../../components/Page';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';

import { defaultProcessCatch, PermissaoAPI } from '../../services/api/index';
import alerts from '../../utils/alerts';

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

const PermissoesAdminLista = () => {
  const classes = useStyles();
  const [permissoes, setPermissoes] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

  const syncPermissoes = () => {
    PermissaoAPI.listAdmin(page.page, page.perPage)
			.then(rs => {
        setPermissoes(rs.permissoes  || []);
        setCount(rs.total_count || 0);
      })
			.catch(defaultProcessCatch());
  }

  const removerPermissao = (uuid, p) => () => {
		alerts.confirmYesNo(
			'Remover permissão',
			`Remover permissão ${p}?`,
			{
				onYes: () => {
          PermissaoAPI._delete(uuid)
            .then(_ => {
              syncPermissoes();
              alerts.snackbars.success('Permissão removida com sucesso');
            })
            .catch(defaultProcessCatch());
        }
			}
    );
	}

  useEffect(() => {
    syncPermissoes(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.page, page.perPage]);

  return (
    <Page title="Permissões" className={classes.root}>
      <Container maxWidth={false} >
				<TableContainer component={Paper}>
					<TableSort rows={permissoes} count={count} page={page} onChangePagination={setPage}>
						<TableSortColumn field="permissao" title="Permissão" />
            <TableSortColumn field="uuid" title="" width={60} padding="none"
                formatter={
                  (uuid, p) => <IconButton onClick={removerPermissao(uuid, p.permissao)}>
                    <DeleteIcon />
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

export default PermissoesAdminLista;
