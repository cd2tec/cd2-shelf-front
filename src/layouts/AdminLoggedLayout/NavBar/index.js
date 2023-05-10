import React, { useEffect, useContext, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Avatar, Box, Drawer, Hidden, List, Typography, makeStyles } from '@material-ui/core';

import NavItem from './NavItem';
import LoggedContext from '../../../context/LoggedContext';
import { Shelf } from '../../../assets/logos';
import { AccountCircle, Lock, ImportExport } from '@material-ui/icons';

import {
  Company as CompanyIcon
} from '../../../assets/icones';

import { themeConfig } from '../../../theme';

const useStyles = makeStyles(() => ({
	mobileDrawer: {
		width: themeConfig.drawerWidth,
	},
	desktopDrawer: {
		width: themeConfig.drawerWidth,
	},
	avatar: {
		cursor: 'pointer',
		width: 64,
		height: 64,
		marginBottom: 12,
	},
	root: {
		height: '100%',
		backgroundColor: '#004a77',
		'& *': {
			color: 'white',
		},
		overflowY: 'auto',
	},
}));

const filterMenu = (permissoes, menus) => {
	const p = permissoes.map(p => p.permissao)
	return menus.filter(perm => p.includes(perm.permissao))
}

const NavBar = ({ onMobileClose, openMobile }) => {
	const { usuario, permissoes } = useContext(LoggedContext);
	const classes = useStyles();
	const location = useLocation();
	const [itemsMenu, setItemsMenu] = useState([])
	
	useEffect(() => {
		const items = [
			{
				href: 'empresas',
				icon: CompanyIcon,
				title: 'Empresas',
				permissao: "adm - visualizar empresas"
			},
			{
				href: 'usuarios',
				icon: AccountCircle,
				title: 'Usuários',
				permissao: "adm - visualizar usuários"
			},
			{
				href: 'permissoes',
				icon: Lock,
				title: 'Permissões',
				permissao: "adm - visualizar permissões"
			},
			{
				href: 'integradores',
				icon: ImportExport,
				title: 'Integradores',
				permissao: "adm - visualizar integradores"
			}
		];
		const menu = filterMenu(permissoes, items)
		setItemsMenu(menu)
   // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [permissoes])

  useEffect(() => {
		if (openMobile && onMobileClose) {
			onMobileClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const content = (
		<div className={classes.root}>
			<Box
				alignItems="center"
				display="flex"
				flexDirection="column"
				p={2}>
				<div style={{ margin: 18, marginBottom: 32, filter: 'invert(1)' }}>
					<Shelf width="70%" />
				</div>
				<Avatar
					className={classes.avatar}
					component={RouterLink}
					src={usuario.avatar}
					to="/app/account" />
				<Typography
					className={classes.name}
					color="textPrimary"
					variant="h5">
					{usuario.nome_completo}
				</Typography>
			</Box>
			<Box p={5}>
				<List>
					{itemsMenu.map((item, index) => (
						<NavItem
							key={index}
							href={item.href}
							title={item.title}
							icon={item.icon}
							items={item.items || []}
						/>
					))}
				</List>
			</Box>
		</div>
	);

	return (
		<>
			<Hidden lgUp>
				<Drawer
					anchor="left"
					classes={{ paper: classes.mobileDrawer }}
					onClose={onMobileClose}
					open={openMobile}
					variant="temporary">
					{content}
				</Drawer>
			</Hidden>
			<Hidden mdDown>
				<Drawer
					anchor="left"
					classes={{ paper: classes.desktopDrawer }}
					open
					variant="persistent">
					{content}
				</Drawer>
			</Hidden>
		</>
	);
};

NavBar.propTypes = {
	onMobileClose: PropTypes.func,
	openMobile: PropTypes.bool
};

NavBar.defaultProps = {
	onMobileClose: () => { },
	openMobile: false
};

export default NavBar;
