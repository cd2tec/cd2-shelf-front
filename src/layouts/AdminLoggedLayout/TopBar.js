import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	AppBar,
	Box,
	Hidden,
	IconButton,
	Toolbar,
	makeStyles,
	Button,
	Menu,
	MenuItem,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ArrowBack from '@material-ui/icons/ArrowBack'
import AccountCircle from '@material-ui/icons/AccountCircle';
import { clearAuthToken } from '../../services/session';
import LoggedContext from '../../context/LoggedContext';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
	root: {
		color: palette.primary.main,
		backgroundColor: palette.background.default,
		borderBottom: '2px solid #bcbec0',
	},
	avatar: {
		width: 60,
		height: 60
	},
	routeBack: {
		marginLeft: breakpoints.up('lg') ? '300px' : '0'
	}
}));

const MENU_OPTIONS = {
	MEU_USUARIO: 'meu-usuario',
	SAIR: 'sair',
}

const TopBar = ({ onMobileNavOpen }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const classes = useStyles();
  const { usuario, clearLoggedUser } = useContext(LoggedContext);
	const [anchorEl, setAnchorEl] = useState(null);

	const handleUserMenuClick = async option => {
		setAnchorEl(null);
		switch (option) {
		  case MENU_OPTIONS.SAIR:
				clearAuthToken();
				clearLoggedUser();
				navigate('/admin/login');
				break;
			default:
				break;
		}
	}

	const backRoute = () => {
		navigate(-1)
	}

	return (
		<AppBar className={classes.root} elevation={0}>
			<Toolbar>
			<Button
					startIcon={<ArrowBack />}
					color="inherit"
					className={classes.routeBack}
					onClick={() => backRoute()}>
					{location.pathname.split("/admin/")}
				</Button>
				<Box flexGrow={1} />
				<Hidden mdDown>
					<Button
						color="inherit"
						startIcon={<AccountCircle />}
						onClick={ev => setAnchorEl(ev.currentTarget)}>
						{usuario.nome}
					</Button>
					<Menu
						keepMounted
						anchorEl={anchorEl}
						getContentAnchorEl={null}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorEl)}
						onClose={() => setAnchorEl()}>
						<MenuItem onClick={() => handleUserMenuClick(MENU_OPTIONS.SAIR)}>Sair</MenuItem>
					</Menu>
				</Hidden>

				<Hidden lgUp>
					<IconButton
						color="inherit"
						onClick={onMobileNavOpen}>
						<MenuIcon />
					</IconButton>
				</Hidden>
			</Toolbar>
		</AppBar>
	);
};

TopBar.propTypes = {
	onMobileNavOpen: PropTypes.func
};

export default TopBar;
