import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from "react-router-dom";
import { Fab, makeStyles, Container, TableContainer, Paper, IconButton } from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';

import Page from '../../components/Page';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';

import { defaultProcessCatch, UsuarioAPI } from '../../services/api/index';
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

const UsuariosAdminLista = () => {
  const navigate = useNavigate()
  const classes = useStyles();
  const [usuarios, setUsuarios] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

  const syncUsuarios = () => {
    UsuarioAPI.listAdmin(page.page, page.perPage)
			.then(rs => {
        setUsuarios(rs.emails ? rs.emails.map(e => ({email: e})) : []);
        setCount(rs.total_count || 0);
      })
			.catch(defaultProcessCatch());
  }


  const removerUsuario = e => () => {
		alerts.confirmYesNo(
			'Remover admin do usuário',
			`Remover admin do usuário ${e}?`,
			{
				onYes: () => {
          UsuarioAPI.removeAdmin(e)
            .then(_ => {
              syncUsuarios();
              alerts.snackbars.success('Admin do usuário removido com sucesso');
            })
            .catch(defaultProcessCatch());
        }
			}
    );
	}
  const editarUsuario = e => () => navigate(`atualizar/${e}`)
  useEffect(() => {
    syncUsuarios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.page, page.perPage]);

  return (
    <Page title="Usuários" className={classes.root}>
      <Container maxWidth={false} >
		  <TableContainer component={Paper}>
			<TableSort rows={usuarios} count={count} page={page} onChangePagination={setPage}>
				<TableSortColumn field="email" title="Email" />
				<TableSortColumn
					field="email"
					title=""
					width={20}
					formatter={
						email => <IconButton onClick={editarUsuario(email)}>
							<EditIcon />
						</IconButton>
					}/>
				<TableSortColumn field="email" title="" width={60} padding="none"
					formatter={
					  email => <IconButton onClick={removerUsuario(email)}>
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

export default UsuariosAdminLista;
