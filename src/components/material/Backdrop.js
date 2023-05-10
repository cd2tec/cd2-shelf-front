import React from 'react';
import { Backdrop as BackdropStd, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	root: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));

const Backdrop = props => {
	const classes = useStyles();
	return <BackdropStd className={classes.root} {...props} />;
}

export default Backdrop;