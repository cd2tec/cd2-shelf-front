import React, { useContext, useState } from 'react';
import { Tab, Tabs, makeStyles } from '@material-ui/core';
import Page from '../../../../components/Page';
import { useParams } from 'react-router-dom';

import TabCadastro from './Cadastro';
import TabVincular from './VincularEmpresa';

import LoggedContext from '../../../../context/LoggedContext';
import { userCan } from '../../../../utils/validation';

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
	CADASTRO: 0,
  VINCULAR: 1
}

const CadastrarUsuario = () => {
	const classes = useStyles();
  const { uuid } = useParams();
  const { permissoes } = useContext(LoggedContext);
  const userCanCadastro = userCan(permissoes, 'configurações - gestão de usuários - cadastrar usuário');
  const userCanVincular = userCan(permissoes, 'configurações - gestão de usuários - vincular usuário a empresa');
  const [tab, setTab] = useState((_ => {
    if(userCanCadastro)
      return TABS.CADASTRO
    if(userCanVincular)
      return TABS.VINCULAR
    return 0
    })()
  );

	return (
		<Page >
			<div className={classes.root} >
				<div className={classes.tabs} >
					<Tabs value={tab}
						orientation="vertical"
						variant="scrollable"
						onChange={(_, tab) => setTab(tab)}
						indicatorColor="primary"
					>
            {userCanCadastro ? <Tab label={uuid ? "Atualizar" : "Novo"} index={TABS.CADASTRO} /> : null}
            {userCanVincular ? <Tab label="Vincular empresa" index={TABS.VINCULAR} /> : null}
					</Tabs>
				</div>
				<div className={classes.tab} >
					{TABS.CADASTRO === tab && userCanCadastro && <TabCadastro uuid={uuid} />}
          {TABS.VINCULAR === tab && userCanVincular && <TabVincular />}
				</div>
			</div>
		</Page>
	);
}

export default CadastrarUsuario;
