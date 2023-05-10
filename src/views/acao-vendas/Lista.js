import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { useNavigate, Link } from 'react-router-dom';

import {
	Paper, makeStyles,
	Container, TableContainer,
	Fab, IconButton, Grid, MenuItem, Divider,
} from '@material-ui/core';
import {
	Add as AddIcon,
	Edit as EditarIcon,
	Timeline as TimelineIcon,
} from '@material-ui/icons';

import Page from '../../components/Page';
import { AcaoVendaAPI, defaultProcessCatch, acaoVendaStatusText, acaoVendaModeloText, AcaoVendaModelo } from '../../services/api';
import LinkButton from '../../components/LinkButton';

import { TableSort, TableSortColumn } from '../../components/material/TableSort';
import { DatePicker, SelectField } from '../../components/material';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

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

const AcaoVendas = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [acoes, setAcoes] = useState([]);
	const [modelo, setModelo] = useState();
	const [validade, setValidade] = useState();
	const navigate = useNavigate();

	useEffect(() => {
		AcaoVendaAPI.list(modelo, validade)
			.then(rs => setAcoes(rs.acoes || []))
			.catch(defaultProcessCatch());
	}, [modelo, validade]);

	return (
		<Page title="Ação de Vendas" className={classes.root}>
			<Container maxWidth={false}>
				<Grid container spacing={2}>
          {userCan(permissoes, 'pricing - ação de vendas - visualizar ações de vendas') ?
            <>
              <Grid item xs={2}>
                <SelectField
                  label="Origem"
                  value={modelo}
                  onChange={v => setModelo(v)}>
                  <MenuItem>- Todos -</MenuItem>
                  <Divider />
                  {
                    userCan(permissoes, 'pricing - ação de vendas - cadastrar ação de vendas - ação de venda') ?
                    <MenuItem value={AcaoVendaModelo.ACAO}>Ação</MenuItem> : null
                  }
                  {
                    userCan(permissoes, 'pricing - ação de vendas - cadastrar ação de vendas - combate') ?
                    <MenuItem value={AcaoVendaModelo.COMBATE}>Combate</MenuItem> : null
                  }
                  {
                    userCan(permissoes, 'pricing - ação de vendas - cadastrar ação de vendas - recuperação') ?
                    <MenuItem value={AcaoVendaModelo.RECUPERACAO}>Recuperação</MenuItem> : null
                  }
                </SelectField>
              </Grid>

              <Grid item xs={2}>
                <DatePicker
                  label="Validade"
                  value={validade}
                  onChange={v => setValidade(v)} />
              </Grid>
            </> : null
          }
					
          {userCan(permissoes, 'pricing - ação de vendas - realizar análise de performance') ?
            <Grid item xs style={{ textAlign: 'right' }}>
              <LinkButton
                startIcon={<TimelineIcon />}
                to="analise-performance">
                Análise de Performance
              </LinkButton>
					  </Grid> : null
          }
				</Grid>

        {userCan(permissoes, 'pricing - ação de vendas - visualizar ações de vendas') ?
          <TableContainer component={Paper}>
            <TableSort rows={acoes} >
              <TableSortColumn field="nome" title="Nome" />
              <TableSortColumn field="modelo" title="Modelo"
                formatter={v => acaoVendaModeloText(v)} />
              <TableSortColumn field="validade_inicio" title="Validade"
                formatter={(_, v) => {
                  return (
                    moment(v.validade_inicio, 'YYYY-MM-DD').format('DD/MM/YYYY') + ' até ' +
                    moment(v.validade_fim, 'YYYY-MM-DD').format('DD/MM/YYYY')
                  );
                }}
              />
              <TableSortColumn field="status" title="Status"
                formatter={status => acaoVendaStatusText(status)}
              />
              <TableSortColumn title="" width={50} padding="none"
                align="center" disabled={true}
                formatter={(_, a) => {
                  return (
                    <React.Fragment>
                      <IconButton component={Link} to={a.uuid || ''}>
                        <EditarIcon />
                      </IconButton>
                    </React.Fragment>
                  );
                }}
              />
            </TableSort>
          </TableContainer> : null
        }

			</Container>

      {userCan(permissoes, 'pricing - ação de vendas - cadastrar ação de vendas') ?
        <Fab color="primary" className={classes.fab} onClick={() => navigate('cadastrar')}>
				  <AddIcon />
			  </Fab> : null
      }
		</Page>
	)
}

export default AcaoVendas;
