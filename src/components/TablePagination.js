import React from 'react';
import PropTypes from 'prop-types';
import { TablePagination as TablePaginationStd, IconButton, makeStyles, useTheme } from '@material-ui/core';
import {
	KeyboardArrowRight, KeyboardArrowLeft,
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,
} from '@material-ui/icons';

const useStyles = makeStyles(({ spacing, palette }) => ({
	root: {
		flexShrink: 0,
		marginLeft: spacing(2.5),
	},

	iconButton: {
		color: palette.primary.main,
	},
}));

function TablePaginationActions(props) {
	const classes = useStyles();
	const theme = useTheme();
	const { count, page, rowsPerPage, onChangePage } = props;

	const handleFirstPageButtonClick = (event) => {
		onChangePage(event, 0);
	};

	const handleBackButtonClick = (event) => {
		onChangePage(event, page - 1);
	};

	const handleNextButtonClick = (event) => {
		onChangePage(event, page + 1);
	};

	const handleLastPageButtonClick = (event) => {
		onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};

	return (
		<div className={classes.root}>
			<IconButton
				classes={{ root: classes.iconButton }}
				onClick={handleFirstPageButtonClick}
				disabled={page === 0}
				aria-label="Primeira Página">
				{theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton
				classes={{ root: classes.iconButton }}
				onClick={handleBackButtonClick}
				disabled={page === 0}
				aria-label="Página Anterior">
				{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				classes={{ root: classes.iconButton }}
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="Próxima Página">
				{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
			</IconButton>
			<IconButton
				classes={{ root: classes.iconButton }}
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="Última Página">
				{theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
			</IconButton>
		</div>
	);
}

TablePaginationActions.propTypes = {
	count: PropTypes.number.isRequired,
	onChangePage: PropTypes.func.isRequired,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
};

export default function TablePagination({ count, page, perPage, onChange, ...props }) {
	const handleChangePage = page => onChange({ page, perPage });
	const handleChangePerPage = perPage => onChange({ page: 1, perPage });

	return (
		<TablePaginationStd {...props}
			rowsPerPageOptions={[10, 25, 50, 100]}
			count={count}
			rowsPerPage={perPage}
			page={count === 0 && page === 1 ? 0 : page - 1}
			onChangePage={(_, page) => handleChangePage(page + 1)}
			onChangeRowsPerPage={event => handleChangePerPage(parseInt(event.target.value, 10))}
			ActionsComponent={TablePaginationActions}
			labelRowsPerPage="Registros por página:" />
	);

}