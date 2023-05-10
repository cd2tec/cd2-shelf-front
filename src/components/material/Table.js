import React from 'react';
import classnames from 'classnames';

import StdTable from '@material-ui/core/Table';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	table: {
		'& tfoot > tr > td': {
			backgroundColor: '#fafafa',
			color: 'rgba(0, 0, 0, 0.87)',
			fontWeight: 500,
			lineHeight: '1.5rem',
		},
	},
	isStickyFooter: {
		'& tfoot > tr > td': {
			bottom: 0,
			left: 0,
			position: 'sticky',
			borderTop: '1px solid rgba(224, 224, 224, 1)',
		},
	}
}))

const Table = ({ stickyFooter, ...props }) => {
	const classes = useStyles();
	return (
		<div className={classnames(classes.table, {
			[classes.isStickyFooter]: stickyFooter === true,
		})}>
			<StdTable {...props} />
		</div>
	);
}

export default Table;
