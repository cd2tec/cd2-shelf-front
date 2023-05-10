import React, { useEffect, useState, useContext } from 'react';
import moment from 'moment';

import { Container, Grid, MenuItem, makeStyles } from '@material-ui/core';

import Page from '../../components/Page';
import GraficoCompetitividade from './components/GraficoCompetitividade';
import GraficoGiroEstoque from './components/GraficoGiroEstoque';
import { defaultProcessCatch, UnidadeAPI } from '../../services/api';
import { TextField } from '../../components/material';
import { Autocomplete } from '@material-ui/lab';
import IndicadorCompra from './indicadores/Compra';
import IndicadorVenda from './indicadores/Venda';
import IndicadorLucro from './indicadores/Lucro';
import IndicadorEstoqueAtual from './indicadores/EstoqueAtual';
import IndicadorOportunidadeLucro from './indicadores/OportunidadeLucro';
import IndicadorLucroRecuperado from './indicadores/LucroRecuperado';
import GraficoDistribuicaoVendas from './components/GraficoDistribuicaoVendas';
import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation'

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(1)
	},
}));

function getMeses(count) {
	let meses = [];
	for (let i = 0; i < count; i++) {
		const mes = moment().subtract(i, 'month');
		meses.push({
			time: mes,
			value: mes.format('YYYY-MM'),
			desc: mes.format('MM/YYYY'),
		})
	}
	return meses;
}

const Dashboard = () => {
	const meses = getMeses(13);
	const classes = useStyles();
	const [unidades, setUnidades] = useState([]);
	const [filtro, setFiltro] = useState({
		anoMes: moment().format('YYYY-MM'),
		unidades: [],
	});
	const onChangeFiltro = v => setFiltro(state => ({ ...state, ...v }))
  const { permissoes } = useContext(LoggedContext);
  const visualizarVenda = userCan(permissoes, 'dashboard - visualizar venda');
  const visualizarLucro = userCan(permissoes, 'dashboard - visualizar lucro');
  const visualizarCompra = userCan(permissoes, 'dashboard - visualizar compra');
  const visualizarOpLucro = userCan(permissoes, 'dashboard - visualizar oportunidade de lucro');
  const visualizarLucroRec = userCan(permissoes, 'dashboard - visualizar lucro recuperado');
  const visualizarEstoque = userCan(permissoes, 'dashboard - visualizar estoque');
  const visualizarDistVendas = userCan(permissoes, 'dashboard - visualizar distribuição de vendas');
  const visualizarGiroEstoque = userCan(permissoes, 'dashboard - visualizar giro de estoque');
  const visualizarCompetitividade = userCan(permissoes, 'dashboard - visualizar competitividade');

	useEffect(() => {
		UnidadeAPI.list()
			.then(rs => setUnidades(rs.unidades || []))
			.catch(defaultProcessCatch());
	}, []);

	const filtroUnidades = filtro.unidades.map(u => u.uuid);
	const periodoParams = {
		ano_mes: filtro.anoMes,
		unidades: filtroUnidades,
	};

	return (
		<Page className={classes.root} title="Dashboard">
			<Container maxWidth={false}>
				<Grid container spacing={2}>
          {visualizarVenda || visualizarLucro || visualizarCompra || visualizarOpLucro || visualizarLucroRec || visualizarEstoque || visualizarDistVendas || visualizarGiroEstoque || visualizarCompetitividade ?
            <Grid item xs={12} container spacing={2}>
              <Grid item>
                <TextField
                  select
                  label="Ano/Mês"
                  value={filtro.anoMes}
                  onChange={anoMes => onChangeFiltro({ anoMes })}
                  fullWidth={false}>
                  {meses.map(m => (
                    <MenuItem key={m.value} value={m.value}>{m.desc}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <Autocomplete
                  multiple
                  limitTags={4}
                  value={filtro.unidades}
                  options={unidades}
                  onChange={(_, unidades) => onChangeFiltro({ unidades })}
                  getOptionLabel={option => `${option.codigo} - ${option.codigo}`}
                  getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Unidades" />
                  )}
                />
              </Grid>
            </Grid> : null
          }	

					<Grid item xs={12} container spacing={2}>
            {visualizarVenda ?
              <Grid item xs={6} md={4}>
							  <IndicadorVenda periodo={periodoParams} />
						  </Grid> : null
            }

            {visualizarLucro ?
              <Grid item xs={6} md={4}>
							  <IndicadorLucro periodo={periodoParams} />
						  </Grid> : null
            }

            {visualizarCompra ?
              <Grid item xs={6} md={4}>
							  <IndicadorCompra periodo={periodoParams} />
						  </Grid> : null
            }
						
            {visualizarOpLucro ?
              <Grid item xs={6} md={4}>
							  <IndicadorOportunidadeLucro periodo={periodoParams} />
						  </Grid> : null
            }
						
            {visualizarLucroRec ?
              <Grid item xs={6} md={4}>
						    <IndicadorLucroRecuperado periodo={periodoParams} />
						  </Grid> : null
            }

						{visualizarEstoque ?
              <Grid item xs={6} md={4}>
							  <IndicadorEstoqueAtual periodo={periodoParams} />
						  </Grid> : null
            }
					</Grid>

          <Grid item xs={12} container spacing={2}>
            {visualizarDistVendas ?
              <Grid item xs={6} md={4}>
							  <GraficoDistribuicaoVendas periodo={periodoParams} />
						  </Grid> : null
            }
            
            {visualizarGiroEstoque ?
              <Grid item xs={6} md={4}>
							  <GraficoGiroEstoque periodo={periodoParams} />
						  </Grid> : null
            }
						
            {visualizarCompetitividade ?
              <Grid item xs={6} md={4}>
							  <GraficoCompetitividade />
						  </Grid> : null
            }
				  </Grid>
				</Grid>
			</Container>
		</Page>
	)
}

export default Dashboard;
