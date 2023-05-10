import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";

import {
	Paper, makeStyles,
	Container, TableContainer,
	IconButton, Fab,
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';

import Page from '../../components/Page';
import { ModeloPrecificacaoAPI, defaultProcessCatch } from '../../services/api';
import { VisualizarIcon } from '../../theme/icones';

import { TableSort, TableSortColumn } from '../../components/material';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

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

const ModeloPrecificacao = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [modelos, setModelos] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		ModeloPrecificacaoAPI.list()
			.then(rs => {
				setModelos(rs.modelos || []);
			})
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Page title="Modelo Precificação" className={classes.root}>
      {userCan(permissoes, 'configurações - visualizar modelos de precificação') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={modelos} >
              <TableSortColumn field="departamento" title="Departamento" />
              <TableSortColumn field="grupo" title="Grupo" />
              <TableSortColumn field="tipo_pesquisa" title="Tipo de Pesquisa" />
              <TableSortColumn field="tipo_precificacao" title="Tipo Precificação" />
              <TableSortColumn field="uuid" disabled
                formatter={uuid => <IconButton component={Link} to={uuid || ''}>
                  <VisualizarIcon />
                </IconButton>}
              />
            </TableSort>
          </TableContainer>
        </Container> : null
      }

      {userCan(permissoes, 'configurações - cadastrar modelo de precificação') ?
        <Fab color="primary" className={classes.fab} onClick={() => navigate('novo')}>
				  <AddIcon />
			  </Fab> : null
      }
		</Page>
	)
}

export default ModeloPrecificacao;
