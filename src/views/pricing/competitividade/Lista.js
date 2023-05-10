import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom";
import moment from 'moment';

import {
	Paper, makeStyles,
	Container, TableContainer, IconButton, Fab,
} from '@material-ui/core';

import {
	Add as AddIcon,
	FindInPageOutlined as FindIcon,
	AssessmentOutlined as AnalyticsIcon,
} from '@material-ui/icons';

import Page from '../../../components/Page';
import { PesquisaAPI, defaultProcessCatch, pesquisaEtapaText, PesquisaEtapa } from '../../../services/api';

import { TableSort, TableSortColumn } from '../../../components/material/TableSort';

import LoggedContext from '../../../context/LoggedContext';
import { userCan } from '../../../utils/validation'

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(11),
		paddingTop: theme.spacing(3)
	},
	actions: {
		textAlign: 'right',
	},
	fab: {
		position: 'fixed',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
	},
}));

const Lista = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [pesquisas, setPesquisas] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		PesquisaAPI.list()
			.then(rs => setPesquisas(rs.pesquisas || []))
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Page title="Pricing / Competitividade / Pesquisas" className={classes.root}>
      {userCan(permissoes, 'pricing - competitividade - visualizar pesquisas') ?
        <Container maxWidth={false}>
          <TableContainer component={Paper}>
            <TableSort rows={pesquisas}>
              <TableSortColumn field="descricao" title="Descrição" />
              <TableSortColumn field="etapa" title="Etapa" width={120}
                formatter={ etapa => pesquisaEtapaText(etapa)}
              />
              <TableSortColumn field="data_cadastro" title="Data de Cadastro" width={170}
                formatter={data_cadastro => moment(data_cadastro).format('DD/MM/YYYY HH:mm')}
              />
              <TableSortColumn title="" padding="none" align="center"
                width={60}
                formatter={(_,obj) => <IconButton
                  component={Link} to={obj.uuid || ''}
                  color={obj.etapa === PesquisaEtapa.PESQUISA ? 'secondary' : 'primary'}>
                  {obj.etapa === PesquisaEtapa.PESQUISA
                    ? <FindIcon />
                    : <AnalyticsIcon />}
                </IconButton>}
              />
            </TableSort>
          </TableContainer>
			  </Container> : null
      }
			
      {userCan(permissoes, 'pricing - competitividade - cadastrar pesquisa') ?
        <Fab color="primary" className={classes.fab} onClick={() => navigate('novo')}>
				  <AddIcon />
			  </Fab> : null
      }
		</Page>
	)
}

export default Lista;
