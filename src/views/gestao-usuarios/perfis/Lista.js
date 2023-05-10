import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import {
	Paper, makeStyles,
	Container, TableContainer,
	Fab, IconButton,
} from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import Page from '../../../components/Page';

import alerts from '../../../utils/alerts'

import { defaultProcessCatch, PerfilServiceApi } from '../../../services/api/index';
import moment from 'moment';

import LoggedContext from '../../../context/LoggedContext';
import { userCan } from '../../../utils/validation';

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
  const { permissoes } = useContext(LoggedContext);
	const [perfis, setPerfis] = useState([]);

  const syncPerfis = () => {
    PerfilServiceApi.list()
			.then(rs => setPerfis(rs.perfis || []))
			.catch(defaultProcessCatch());
  }

	useEffect(() => {
    syncPerfis();
  }, [])

	const removerPerfil = p => () => {
		alerts.confirmYesNo(
			'Remover perfil',
			`Remover ${p.nome}?`,
			{
				onYes: () => {
          PerfilServiceApi._delete(p.uuid)
            .then(_ => {
              syncPerfis();
              alerts.snackbars.success('Perfil removido com sucesso');
            })
            .catch(defaultProcessCatch());
        }
			}
    );
	}

	return (
		<Page title="Perfis - Gestão de Usuários" className={classes.root} >
			<Container maxWidth={false} >
				<TableContainer component={Paper}>
					<TableSort rows={perfis} >
						<TableSortColumn field="nome" title="Nome" width={350} />
						<TableSortColumn field="descricao" title="Descrição" />
						<TableSortColumn field="data_cadastro" title="Data Cadastro" formatter={data => moment(data).format("DD/MM/YYYY [às] HH:mm")} />
						<TableSortColumn field="uuid" width="120px" padding="none" formatter={(uuid, perfil) => <>
              {userCan(permissoes, 'configurações - gestão de usuários - editar perfil') ?
                <IconButton component={Link} to={`perfis/${uuid}`} >
								  <EditIcon />
							  </IconButton> : null
              }

              {userCan(permissoes, 'configurações - gestão de usuários - remover perfil') ?
                <IconButton onClick={removerPerfil(perfil)} >
								  <DeleteIcon />
							  </IconButton> : null
              }
              </>
					  } />
					</TableSort>
				</TableContainer>
			</Container>

      {userCan(permissoes, 'configurações - gestão de usuários - cadastrar perfil') ?
        <Fab color="primary" component={Link} to={"perfis/novo"} className={classes.fab}>
				  <AddIcon />
			  </Fab> : null
      }
	  </Page>
	);
}

export default Lista;
