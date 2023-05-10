import React, { useContext, useState } from 'react';
import { Tab, Tabs, makeStyles } from '@material-ui/core';
import Page from '../../components/Page';

import TabUsuarios from './usuarios/Lista';
import TabPerfis from './perfis/Lista';
import TabPermissoes from './permissoes/Lista';

import LoggedContext from '../../context/LoggedContext';
import { userCan } from '../../utils/validation';

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
	USUARIOS: 0,
	PERFIS: 1,
  PERMISSOES: 2,
}

const GestaoUsuarios = () => {
	const classes = useStyles();
  const { permissoes } = useContext(LoggedContext);
  const userCanUsuario = userCan(permissoes, 'configurações - gestão de usuários - visualizar usuários');
  const userCanPerfil = userCan(permissoes, 'configurações - gestão de usuários - visualizar perfis');
  const userCanPermissao = userCan(permissoes, 'configurações - gestão de usuários - visualizar permissões');
  const [tab, setTab] = useState((_ => {
    if(userCanUsuario)
      return TABS.USUARIOS
    if(userCanPerfil)
      return TABS.PERFIS
    if(userCanPermissao)
      return TABS.PERMISSOES
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
            {userCanUsuario ? <Tab label="Usuários" index={TABS.USUARIOS} /> : null}
            {userCanPerfil ? <Tab label="Perfis" index={TABS.PERFIS} /> : null}
            {userCanPermissao ? <Tab label="Permissões" index={TABS.PERMISSOES} /> : null}
					</Tabs>
				</div>
				<div className={classes.tab} >
					{TABS.USUARIOS === tab && userCanUsuario && <TabUsuarios />}
					{TABS.PERFIS === tab && userCanPerfil && <TabPerfis />}
          {TABS.PERMISSOES === tab && userCanPermissao && <TabPermissoes />}
				</div>
			</div>
		</Page>
	);
}

export default GestaoUsuarios;
