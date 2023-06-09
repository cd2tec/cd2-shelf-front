import React from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(({ palette }) => ({
	root: {
		backgroundColor: palette.background.default,
		display: 'flex',
		height: '100%',
		overflow: 'hidden',
		width: '100%'
	},
	wrapper: {
		display: 'flex',
		flex: '1 1 auto',
		overflow: 'hidden',
	},
	contentContainer: {
		display: 'flex',
		flex: '1 1 auto',
		overflow: 'hidden'
	},
	content: {
		flex: '1 1 auto',
		height: '100%',
		overflow: 'auto'
	},
}));

function MainLayout() {
	const classes = useStyles();
	return (
		<div className={classes.root}>
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

export default MainLayout;