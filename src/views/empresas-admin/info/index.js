import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, makeStyles } from '@material-ui/core';
import Page from '../../../components/Page';

import TabProdutos from './produtos/Lista';
import TabUnidades from './unidades/Lista';
import TabFornecedores from './fornecedores/Lista';
import TabConcorrentes from './concorrentes/Lista';
import TabMovimentos from './movimentos/Lista';
import TabCurvas from './curvas/Lista';
import TabAPIKeys from './apikeys/Lista'

const useStyles = makeStyles(() => ({
	root: {
		display: 'flex',
	},
	tabs: {
		width: 250,
		height: 'calc(100vh - 66px)',
		backgroundColor: '#F1F1F1',
	},
	tab: {
		flex: 1,
	}
}));

const TABS = {
	PRODUTOS: 0,
  UNIDADES: 1,
  FORNECEDORES: 2,
  CONCORRENTES: 3,
  MOVIMENTOS: 4,
  CURVAS: 5,
	APIKEYS: 6
}

const InfoEmpresas = () => {
	const classes = useStyles();
  const { uuid, recurso } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState((_ => {
    return TABS[recurso.toUpperCase()]
    })()
  );

	return (
		<Page >
			<div className={classes.root} >
				<div className={classes.tabs} >
					<Tabs value={tab}
						orientation="vertical"
						variant="scrollable"
						onChange={(_, tab) => {
              const p = Object.keys(TABS)[tab].toLowerCase()
              navigate("/admin/empresas/" + uuid + "/" + p)
              setTab(tab)
            }}
						indicatorColor="primary"
					>
            <Tab label="Produtos" index={TABS.PRODUTOS} />
            <Tab label="Unidades" index={TABS.UNIDADES} />
            <Tab label="Fornecedores" index={TABS.FORNECEDORES} />
            <Tab label="Concorrentes" index={TABS.CONCORRENTES} />
            <Tab label="Movimentos" index={TABS.MOVIMENTOS} />
            <Tab label="Curvas" index={TABS.CURVAS} />
            <Tab label="API Keys" index={TABS.APIKEYS} />
          </Tabs>
				</div>
				<div className={classes.tab} >
					{TABS.PRODUTOS === tab && <TabProdutos uuid={uuid} />}
          {TABS.UNIDADES === tab && <TabUnidades uuid={uuid} />}
          {TABS.FORNECEDORES === tab && <TabFornecedores uuid={uuid} />}
          {TABS.CONCORRENTES === tab && <TabConcorrentes uuid={uuid} />}
          {TABS.MOVIMENTOS === tab && <TabMovimentos uuid={uuid} />}
          {TABS.CURVAS === tab && <TabCurvas uuid={uuid} />}
					{TABS.APIKEYS === tab && <TabAPIKeys uuid={uuid} />}
				</div>
			</div>
		</Page>
	);
}

export default InfoEmpresas;
