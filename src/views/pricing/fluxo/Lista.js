import React, { useState, useEffect, useCallback, useContext } from 'react';
import moment from 'moment';

import {
	Paper, makeStyles,
	Container,
	TableContainer,
	IconButton,
	colors,
	MenuItem,
	Grid,
	Tooltip,
	Typography,
} from '@material-ui/core';
import {
	Edit as EditarIcon,
	Assignment as AssignmentIcon,
} from '@material-ui/icons';

import ProdutosDialog from './ProdutosDialog';
import Page from '../../../components/Page';
import { FluxoAPI, defaultProcessCatch, fluxoOrigemText, fluxoStatusText, FluxoStatus, FluxoOrigem } from '../../../services/api';
import { TextField, TableSort, TableSortColumn } from '../../../components/material';
import RelatorioAlteracoesDialog from './RelatorioAlteracoesDialog';

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

const detectColorStatus = status => {
	if (status === FluxoStatus.APROVADO || status === FluxoStatus.SINCRONIZADO) return colors.green[600];
	if (status === FluxoStatus.RECUSADO) return colors.red[600];
	return colors.blue[600];
};

const ListaFluxos = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
	const [fluxos, setFluxos] = useState([]);
	const [dialog, setDialog] = useState(null);

	const [filtroStatus, setFiltroStatus] = useState(FluxoStatus.PENDENTE);
	const [filtroOrigem, setFiltroOrigem] = useState();

	const reloadFluxos = useCallback(() => {
		FluxoAPI.listFluxos(filtroOrigem || undefined, filtroStatus || undefined)
			.then(rs => setFluxos(rs.fluxos || []))
			.catch(defaultProcessCatch());
	}, [filtroOrigem, filtroStatus]);

	useEffect(() => {
		reloadFluxos();
	}, [reloadFluxos, filtroOrigem, filtroStatus]);

	const openRelatorio = fluxo => setDialog(
		<RelatorioAlteracoesDialog
			fluxo={fluxo}
			onClose={() => setDialog(null)} />
	)

	const openEdicaoProdutos = fluxo => setDialog(
		<ProdutosDialog
			fluxo={fluxo}
			onClose={hasChanges => {
				if (hasChanges) reloadFluxos();
				setDialog(null);
			}} />
	)

	return (
		<React.Fragment>
			<Page title="Pricing - Fluxos" className={classes.root}>
        {userCan(permissoes, 'pricing - release workflow - visualizar workflows') ?
          <Container maxWidth={false}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Origem"
                  value={filtroOrigem}
                  onChange={v => setFiltroOrigem(v)}>
                  <MenuItem>- Todos -</MenuItem>
                  {
                    [FluxoOrigem.ACAOVENDA, FluxoOrigem.PESQUISA, FluxoOrigem.GESTAOCATEGORIA, FluxoOrigem.AQUISICAO]
                      .map((v, index) => {
                        return <MenuItem key={index} value={v}>{fluxoOrigemText(v)}</MenuItem>;
                      })
                  }
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Status"
                  value={filtroStatus}
                  onChange={v => setFiltroStatus(v)}>
                  <MenuItem>- Todos -</MenuItem>
                  {[FluxoStatus.APROVADO, FluxoStatus.SINCRONIZADO, FluxoStatus.PENDENTE, FluxoStatus.RECUSADO].map(s => (
                    <MenuItem key={s} value={s}>{fluxoStatusText(s)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <TableSort rows={fluxos} >
                <TableSortColumn field="data_cadastro" title="Data"
                  formatter={data_cadastro => moment(data_cadastro).format('DD/MM/YYYY')} />

                <TableSortColumn field="origem" title="Origem"
                  formatter={tipo => fluxoOrigemText(tipo)} />

                <TableSortColumn field="nome" title="Nome" />

                <TableSortColumn field="unidades" disabled title="Unidade"
                  formatter={unidades => (unidades || []).map(u => u.codigo).join(', ')} />

                <TableSortColumn field="stats.quantidade_produtos_alterados" title="Qtd. Itens"
                  formatter={v => v || 0} />

                <TableSortColumn field="stats.quantidade_produtos_aprovados" title="Qtd. Itens Aprovados"
                  formatter={v => v || 0} />

                <TableSortColumn field="stats.quantidade_produtos_recusados" title="Qtd. Itens Recusados"
                  formatter={v => v || 0} />

                <TableSortColumn field="status" title="Status"
                  formatter={status =>
                    <Typography style={{ textTransform: 'uppercase', color: detectColorStatus(status) }} >{fluxoStatusText(status)}</Typography>
                  } />

                <TableSortColumn field="autorizacao.data" title="Data Autorização"
                  formatter={(_, f) => f.autorizacao
                    ? moment(f.autorizacao.data).format('DD/MM/YYYY [às] HH:mm')
                    : '-'} />

                <TableSortColumn field="autorizacao.usuario.nome" title="Usuário Autorizador"
                  formatter={(_, f) => f.autorizacao && f.autorizacao.usuario
                    ? f.autorizacao.usuario.nome_completo
                    : '-'} />

                <TableSortColumn formatter={
                  (_, f) => <React.Fragment>
                    {f.status === FluxoStatus.APROVADO || f.status === FluxoStatus.SINCRONIZADO
                      ? (
                        <Tooltip title="Relatório de Atualização de Preços">
                          <IconButton color="secondary" onClick={() => openRelatorio(f)}>
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      )
                      : null}
                    <IconButton color="primary" onClick={() => openEdicaoProdutos(f)}>
                      <EditarIcon />
                    </IconButton>
                  </React.Fragment>
                } />
              </TableSort>
            </TableContainer>
          </Container> : null
        }
			</Page>

			{dialog}
		</React.Fragment>
	)
}

export default ListaFluxos;
