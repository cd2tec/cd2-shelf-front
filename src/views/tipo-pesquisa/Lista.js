import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from "react-router-dom";

import {
	Paper, makeStyles,
	Container,
	TableContainer,
	Fab,
	IconButton,
} from '@material-ui/core';
import { Add as AddIcon, Edit as EditarIcon } from '@material-ui/icons';

import Page from '../../components/Page';
import { TipoPesquisaAPI, defaultProcessCatch } from '../../services/api';
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

const TipoPesquisa = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [tipos, setTipos] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		TipoPesquisaAPI.list()
			.then(rs => {
				setTipos(rs.tipos || []);
			})
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Page title="Tipos Pesquisa" className={classes.root}>
      {userCan(permissoes, 'configurações - visualizar tipos de pesquisa') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={tipos} >
              <TableSortColumn field="nome" title="Nome" />
              <TableSortColumn field="uuid" padding="none" width={60} disabled
                formatter={uuid => (
                  <IconButton component={Link} to={uuid || ''}>
                    <EditarIcon />
                  </IconButton>
                )} />
            </TableSort>
          </TableContainer>
        </Container> : null
      }
			
      {userCan(permissoes, 'configurações - cadastrar tipo de pesquisa') ?
        <Fab color="primary" className={classes.fab} onClick={() => navigate('novo')}>
				  <AddIcon />
			  </Fab> : null
      }
    </Page>
	)
}

export default TipoPesquisa;
