import React, { useState, useEffect } from 'react';
import {
	Paper, makeStyles, Container,
	TableContainer, Fab
} from '@material-ui/core';

import Page from '../../../../components/Page';
import {defaultProcessCatch, UsuarioAPI} from '../../../../services/api';

import { TableSort, TableSortColumn } from '../../../../components/material';
import {Add as AddIcon} from "@material-ui/icons";
import {Link} from "react-router-dom";


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

const APIKeys = ({uuid}) => {
	const classes = useStyles();
	const [keys, setKeys] = useState([]);
	// const [page, setPage] = useState({
	// 	perPage: 10,
	// 	page: 1,
	// });

	useEffect(() => {
		UsuarioAPI.listAPIKeys(uuid)
			.then(rs => {
				const mapped = rs.apikey.reduce((acc, cur) => {
					acc.push({key: cur})
					return acc
				}, [])
				setKeys(mapped)
			})
			.catch(defaultProcessCatch)
	}, [uuid]);

	return (
		<Page title="API KEYS" className={classes.root}>
      <Container maxWidth={false}>
        <TableContainer component={Paper}>
          <TableSort rows={keys} >
            <TableSortColumn field="key" title="ACCESS KEY" width={130} />
          </TableSort>
        </TableContainer>
      </Container>
			<Fab color="primary" component={Link} to={"novo"} className={classes.fab}>
				<AddIcon />
			</Fab>
		</Page>
	)
}

export default APIKeys;
