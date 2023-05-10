import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import moment from 'moment';

import {
	Paper, makeStyles,
	Container, TableContainer,
	IconButton, Fab, Grid, Tooltip
} from '@material-ui/core';
import {
	Add as AddIcon,
	Visibility as EditarIcon,
	Timeline
} from '@material-ui/icons';

import LinkButton from '../../../components/LinkButton';
import Page from '../../../components/Page';
import { GestaoCategoriaAPI, defaultProcessCatch, gestaoCategoriaRankingCurvaFormatoText, gestaoCategoriaStatusCategoria } from '../../../services/api';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import LoggedContext from '../../../context/LoggedContext';
import { userCan } from '../../../utils/validation';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(11),
		paddingTop: theme.spacing(3)
	},
	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

const ListaGestaoCategorias = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [processos, setProcessos] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		GestaoCategoriaAPI.listGestaoCategorias()
			.then(rs => setProcessos(rs.processos || []))
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Page title="Pricing - Gestão de Categorias" className={classes.root}>
			<Container maxWidth={false}>
        {userCan(permissoes, 'pricing - gestão de categorias - realizar análise de performance') ?
          <Grid container={true} spacing={2} justify="flex-end" style={{ marginBottom: 8 }}>
            <Grid item>
              <LinkButton
                startIcon={<Timeline />}
                to="/app/pricing/gestao-categorias/analise-performance">
                Análise de Performance
              </LinkButton>
            </Grid>
          </Grid> : null
        }

        {userCan(permissoes, 'pricing - gestão de categorias - visualizar processos de gestão de categorias') ?
          <TableContainer component={Paper}>
            <TableSort rows={processos}
              renderRow={(row, dados) => {
                row.onClick = () => navigate(dados.uuid);
                return row;
              }}
            >
              <TableSortColumn field="nome" title="Nome" disabled={true} />
              <TableSortColumn field="tipo_ranking" title="Formato" width={150}
                disabled={true}
                formatter={tipo_ranking => gestaoCategoriaRankingCurvaFormatoText(tipo_ranking)} />

              <TableSortColumn field="periodo.inicio" title="Período" width={230}
                disabled={true}
                formatter={(_, p) => {
                  return (
                    moment(p.periodo.inicio, 'YYYY-MM-DD').format('DD/MM/YYYY')
                    + ' até ' +
                    moment(p.periodo.fim, 'YYYY-MM-DD').format('DD/MM/YYYY')
                  );
                }}
              />
              <TableSortColumn title="Unidades"
                disabled={true}
                formatter={(_, p) => {
                  return (
                    p.todas_unidades
                      ? 'Todas Unidades'
                      : (p.unidades || []).map(u => u.codigo).join(', ')
                  );
                }}
              />
              <TableSortColumn disabled={true} title="Departamentos"
                formatter={(_, p) => {
                  return (
                    p.todos_departamentos
                      ? 'Todos Departamentos'
                      : (p.departamentos || []).map(d => d.nome).join(', ')
                  );
                }}
              />
              <TableSortColumn field="uuid" title="" width={50}
                padding="none" disabled={true}
                formatter={(uuid, p) => {
                  const [cor, texto] = gestaoCategoriaStatusCategoria(p.status_categorias);
                  return (
                    <IconButton style={{ color: cor }} component={Link} to={uuid || ''}>
                      <Tooltip title={texto} >
                        <EditarIcon />
                      </Tooltip>
                    </IconButton>
                  );
                }}
              />
            </TableSort>
          </TableContainer> : null
        }
			</Container>

      {userCan(permissoes, 'pricing - gestão de categorias - cadastrar processo de gestão de categorias') ?
        <Fab color="primary" className={classes.fab} onClick={() => navigate('novo')}>
				  <AddIcon />
			  </Fab> : null
      }
		</Page>
	)
}

export default ListaGestaoCategorias;
