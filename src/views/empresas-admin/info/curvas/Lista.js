import React, { useState, useEffect } from 'react';
import {
  Fab, Paper, makeStyles, Container,
	TableContainer, IconButton
} from '@material-ui/core';

import { Link } from "react-router-dom";

import Page from '../../../../components/Page';
import { CurvaAPI, defaultProcessCatch } from '../../../../services/api';

import { TableSort, TableSortColumn } from '../../../../components/material/TableSort';

import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import alerts from '../../../../utils/alerts';


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

const Curvas = ({uuid}) => {
	const classes = useStyles();
	const [curvas, setCurvas] = useState([]);
  
  const syncCurvas = () => {
    CurvaAPI.listAdmin(uuid)
			.then(rs => {
				setCurvas(rs.curvas || []);
			})
			.catch(defaultProcessCatch());
  }

	useEffect(() => {
    syncCurvas()
  // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uuid]);

  const removerCurva = c => () => {
		alerts.confirmYesNo(
			'Remover curva',
			`Remover curva ${c.letra}?`,
			{
				onYes: () => {
          CurvaAPI.deleteAdmin(uuid, c.letra, c.porcentagem)
            .then(_ => {
              syncCurvas();
              alerts.snackbars.success('Curva removida com sucesso');
            })
            .catch(defaultProcessCatch());
        }
			}
    );
	}

	return (
		<Page title="Curvas" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <TableSort rows={curvas} >
            <TableSortColumn field="letra" title="Letra" />
            <TableSortColumn field="porcentagem" title="Porcentagem" />
            <TableSortColumn width="120px" padding="none" formatter={(_, c) => (<IconButton onClick={removerCurva(c)} >
								  <DeleteIcon />
							  </IconButton>)}/>
          </TableSort>
        </TableContainer>
      </Container>
      <Fab color="primary" component={Link} to={"novo"} className={classes.fab}>
        <AddIcon />
      </Fab>
		</Page>
	)
}

export default Curvas;
