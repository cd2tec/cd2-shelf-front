import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";

import {
	Paper, makeStyles,
	Container, TableContainer, IconButton,
} from '@material-ui/core';

import Page from '../../components/Page';
import { FornecedorAPI, FornecedorTipoInscricao, defaultProcessCatch } from '../../services/api';
import { VisualizarIcon } from '../../theme/icones';
import { formatCPFOrCNPJ } from '../../utils/formats';
import { TableSort, TableSortColumn } from '../../components/material/TableSort';
import LoggedContext from '../../context/LoggedContext'
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

function formatNumeroInscricao({ tipo_inscricao, numero_inscricao }) {
	if (tipo_inscricao === FornecedorTipoInscricao.PESSOAFISICA ||
		tipo_inscricao === FornecedorTipoInscricao.PESSOAJURIDICA) {
		return formatCPFOrCNPJ(numero_inscricao);
	}
	return '- não definido -';
}

const Fornecedores = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [fornecedores, setFornecedores] = useState([]);
	const [countFornecedores, setCountFornecedores] = useState(0);
	const [page, setPage] = useState({
		perPage: 10,
		page: 1,
	});

	const onChangePage = page => setPage(page);

	useEffect(() => {
		FornecedorAPI.list(page.page, page.perPage)
			.then(rs => {
				setFornecedores(rs.fornecedores || []);
				setCountFornecedores(rs.total_count || 0);
			})
			.catch(defaultProcessCatch());
	}, [page.page, page.perPage]);

	return (
		<Page title="Fornecedores" className={classes.root}>
      {userCan(permissoes, 'cadastros - visualizar fornecedores') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={fornecedores} page={page} count={countFornecedores}
              onChangePagination={onChangePage} >
              <TableSortColumn field="codigo" title="Código" width={140} />
              <TableSortColumn title="Número Inscrição" width={180}
                formatter={(_,v) => formatNumeroInscricao(v)}
              />
              <TableSortColumn field="nome" title="Nome" />
              <TableSortColumn field="razao_social" title="Razão Social" />
              <TableSortColumn field="uuid" title="" width={60} padding="none"
                disabled={true}
                formatter={(uuid) => <IconButton component={Link} to={uuid || ''}>
                  <VisualizarIcon />
                </IconButton>}
              />
            </TableSort>
          </TableContainer>
			  </Container> : null
      }
		</Page>
	)
}

export default Fornecedores;
