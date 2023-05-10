import React, { useState, useEffect, useContext } from 'react';

import {
	Paper, makeStyles,
	Container, TableContainer,
} from '@material-ui/core';

import Page from '../../components/Page';
import { UnidadeAPI, defaultProcessCatch } from '../../services/api';
import { formatCPFOrCNPJ } from '../../utils/formats';

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

const Unidades = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [unidades, setUnidades] = useState([]);

	useEffect(() => {
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Page title="Unidades" className={classes.root}>
      {userCan(permissoes, 'cadastros - visualizar unidades') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={unidades} >
              <TableSortColumn field="cnpj" title="CNPJ" width={180} formatter={v => formatCPFOrCNPJ(v)} />
              <TableSortColumn field="codigo" title="Nome" />
            </TableSort>
          </TableContainer>
			  </Container> : null
      }
		</Page>
	)
}

export default Unidades;
