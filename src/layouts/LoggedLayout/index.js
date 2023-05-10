import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import NavBar from './NavBar';
import TopBar from './TopBar';
import LoggedContext from '../../context/LoggedContext';
import { themeConfig } from '../../theme';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: '#f4f6f8',
	},
	wrapper: {
		display: 'flex',
		flex: '1 1 auto',
		paddingTop: 64,
		[theme.breakpoints.up('lg')]: {
			paddingLeft: themeConfig.drawerWidth,
		}
	},
	contentContainer: {
		display: 'flex',
		flex: '1 1 auto'
	},
	content: {
		flex: '1 1 auto',
		height: '100%'
	}
}));

function LoggedLayout() {
	const loggedUser = useContext(LoggedContext);
	const classes = useStyles();
	const [isMobileNavOpen, setMobileNavOpen] = useState(false);

	if (!loggedUser.usuario) return null;

	return (
		<div className={classes.root}>
			<NavBar
				onMobileClose={() => setMobileNavOpen(false)}
				openMobile={isMobileNavOpen} />

			<TopBar onMobileNavOpen={() => setMobileNavOpen(true)} />

			<div className={classes.wrapper}>
				<div className={classes.contentContainer}>
					<div className={classes.content}>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}

export default LoggedLayout;
