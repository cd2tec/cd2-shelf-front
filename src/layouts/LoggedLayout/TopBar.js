import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	AppBar,
	Badge,
	Box,
	Hidden,
	IconButton,
	Toolbar,
	makeStyles,
	Button,
	Tooltip,
	Menu,
	MenuItem,
	Divider,
	ListItemText
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import LocationCity from '@material-ui/icons/LocationCity';
import ArrowBack from '@material-ui/icons/ArrowBack'
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import CalculateIcon from '@material-ui/icons/Keyboard';
import CalculadoraDialog from '../../views/produtos/calculadora';
import SelecionarEntidade from '../../views/auth/SelecionarEntidade';
import LoggedContext from '../../context/LoggedContext';
import { clearAuthToken } from '../../services/session';
import EdicaoPrecoDialog from '../../views/produtos/EdicaoPrecoDialog';
import PesquisaProdutosDialog from '../../views/produtos/PesquisaDialog';
import { defaultProcessCatch, EntidadeAPI, FluxoOrigem } from '../../services/api';
import MeuUsuarioDialog from '../../views/usuario/MeuUsuarioDialog';

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
	const navigate = useNavigate();
	const location = useLocation();
	const { usuario, entidade, entidades, clearLoggedUser } = useContext(LoggedContext);
	const classes = useStyles();
	const [notifications, setNotifications] = useState([]);
	const [dialog, setDialog] = useState(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const [anchorNotificationsEl, setAnchorNotificationsEl] = useState(null);

	const openCalculadora = () => setDialog(<CalculadoraDialog onClose={() => setDialog()} />)
	const openTesteEdicaoProduto = () => setDialog(
		<PesquisaProdutosDialog
			multiple={false}
			onClose={produto => {
				if (!produto) {
					setDialog(null);
					return;
				}

				setDialog(
					<EdicaoPrecoDialog
						produtoUUID={produto.uuid}
						fluxoOrigem={FluxoOrigem.AQUISICAO}
						onClose={() => setDialog(null)} />
				);
			}} />
	)
	const selecionarEntidade = () => setDialog(<SelecionarEntidade onClose={() => setDialog()} />)
	const handleUserMenuClick = async option => {
		setAnchorEl(null);
		switch (option) {
			case MENU_OPTIONS.MEU_USUARIO:
				setDialog(
					<MeuUsuarioDialog
						onClose={() => setDialog()} />
				);
				break;
			case MENU_OPTIONS.SAIR:
				clearAuthToken();
				clearLoggedUser();
				navigate('/');
				break;
			default:
				break;
		}
	}

	useEffect(() => {
		const refresh = () => {
			EntidadeAPI.listAlertas()
				.then(rs => setNotifications(rs.alertas || []))
				.catch(defaultProcessCatch());
		}
		refresh();

		const handler = setInterval(() => refresh(), 15000);
		return () => {
			clearInterval(handler);
		}
	}, [entidade.uuid]);

	const tempAdmins = ['oliver@tempocerto.inf.br', 'marcio.almeida@nexxera.com', 'junior@unitrier.com.br', 'lara.lodi@nexxera.com', 'kamila@unitrier.com.br'];

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
					{location.pathname.split("/app/")}
				</Button>

				<Box flexGrow={1} />
				<Hidden mdDown>
					{tempAdmins.indexOf(usuario.email) > -1 ? (
						<IconButton color="inherit" onClick={openTesteEdicaoProduto} >
							<Tooltip title="TESTE EDIÇÃO PRODUTO" >
								<AnnouncementIcon />
							</Tooltip>
						</IconButton>
					) : null}

					<IconButton color="inherit" onClick={openCalculadora} >
						<Tooltip title="Calculadora" >
							<CalculateIcon />
						</Tooltip>
					</IconButton>

					<IconButton
						color={notifications.length ? 'secondary' : 'primary'}
						onClick={ev => setAnchorNotificationsEl(ev.currentTarget)}>
						<Badge
							badgeContent={notifications.length}
							color="secondary"
							variant="standard">
							<NotificationsIcon />
						</Badge>
					</IconButton>
					<Menu
						keepMounted
						anchorEl={anchorNotificationsEl}
						getContentAnchorEl={null}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorNotificationsEl)}
						onClose={() => setAnchorNotificationsEl()}>
						{notifications.map((n, index) => (
							<MenuItem key={index}>
								<ListItemText
									primary={n.title}
									secondary={n.description} />
							</MenuItem>
						))}
					</Menu>

					{entidades.length > 1 ? (
						<Button startIcon={<LocationCity />} color="inherit" onClick={() => selecionarEntidade()}>
							{entidade.nome}
						</Button>
					) : null}

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
						<MenuItem onClick={() => handleUserMenuClick(MENU_OPTIONS.MEU_USUARIO)}>Meu Usuário</MenuItem>
						<Divider />
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
			{dialog}
		</AppBar>
	);
};

TopBar.propTypes = {
	onMobileNavOpen: PropTypes.func
};

export default TopBar;
