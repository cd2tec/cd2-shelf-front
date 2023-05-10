import React from 'react';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core';
import {
	SpeedDial as SpeedDialStd,
	SpeedDialAction,
	SpeedDialIcon,
} from '@material-ui/lab';

const useStyles = makeStyles(theme => ({
	root: {
		position: 'fixed',
		zIndex: theme.zIndex.drawer + 2,
		bottom: theme.spacing(2),
		right: theme.spacing(2),
		'& > div > span > span': {
			width: 'max-content',
		}
	},
}));

const SpeedDial = ({ className, ...props }) => {
	const classes = useStyles();
	return (
		<SpeedDialStd
			className={classnames(className, classes.root)}
			icon={<SpeedDialIcon />}
			{...props} />
	);
}

export {
	SpeedDial,
	SpeedDialAction,
};