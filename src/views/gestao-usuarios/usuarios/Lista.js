import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import {
	Paper, makeStyles,
	Container, TableContainer,
	IconButton, Fab,
} from '@material-ui/core';
import { Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import Page from '../../../components/Page';

import { defaultProcessCatch, UsuarioAPI } from '../../../services/api/index';

import LoggedContext from '../../../context/LoggedContext';
import { userCan } from '../../../utils/validation';

import alerts from '../../../utils/alerts';

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

const Usuarios = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [usuarios, setUsuarios] = useState([]);

  const syncUsuarios = () => {
    UsuarioAPI.list()
			.then(rs => setUsuarios(rs.usuarios || []))
			.catch(defaultProcessCatch());
  }

  const removerUsuario = usuario => () => {
    alerts.confirmYesNo(
      'Remover usuário',
      `Remover ${usuario.nome}?`,
      {
        onYes: () => {
          UsuarioAPI._delete(usuario.uuid)
            .then(_ => {
              syncUsuarios();
              alerts.snackbars.success('Usuário removido com sucesso');
            })
            .catch(defaultProcessCatch());
        }
      }
    );
  }

	useEffect(() => {
    syncUsuarios();
  }, [])

	return (
		<Page title="Usuários - Gestão de Usuários" className={classes.root} >
			<Container maxWidth={false} >
				<TableContainer component={Paper}>
					<TableSort rows={usuarios} >
						<TableSortColumn field="nome_completo" title="Nome" width={250} />
						<TableSortColumn field="email" title="Email" width={280} />
            <TableSortColumn field="uuid" width="60px" padding="none" formatter={(uuid, usuario) =>
              <>
                {userCan(permissoes, 'configurações - gestão de usuários - editar usuário') ?
                  <IconButton component={Link} to={`usuarios/${uuid}`} >
                    <EditIcon />
                  </IconButton> : null
                }
                {userCan(permissoes, 'configurações - gestão de usuários - remover usuário') ?
                  <IconButton onClick={removerUsuario(usuario)} >
                    <DeleteIcon />
                  </IconButton> : null
                }
              </>} />
					</TableSort>
				</TableContainer>
			</Container>

      {userCan(permissoes, 'configurações - gestão de usuários - cadastrar usuário') || userCan(permissoes, 'configurações - gestão de usuários - vincular usuário a empresa') ?
        <Fab color="primary" className={classes.fab} component={Link} to={"usuarios/novo"}>
				  <AddIcon />
			  </Fab> : null
      } 
	  </Page>
	);
}


export default Usuarios;
