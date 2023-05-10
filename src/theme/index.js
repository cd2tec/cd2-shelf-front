import { createMuiTheme } from '@material-ui/core';
import { blueGrey } from '@material-ui/core/colors';

const theme = createMuiTheme({
	palette: {
		background: {
			default: '#f4f6f8',
		},
		primary: {
			light: '#757ce8',
			main: '#0c4b74',
			dark: '#002884',
			contrastText: '#fff',
		},
	},
	props: {
		MuiButton: {
			disableElevation: true,
		},
	},
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0,
			},
		},
		MuiCard: {
			root: {
				borderRadius: 8,
			},
		},
		MuiOutlinedInput: {
			root: {
				borderRadius: 0,
			},
		},
		MuiTable: {
			root: {
				backgroundColor: '#ffffff',
			},
		},
		MuiTableCell: {
			head: {
				backgroundColor: '#d1d3d4',
				color: '#014a77',
			},
		},
		MuiTableRow: {
			root: {
				'&$selected': {
					backgroundColor: blueGrey[300],
				},
			},
		},
		MuiTableSortLabel: {
			active: {
				color: '#014a77 !important',
			},
		},
		MuiTablePagination: {
			root: {
				backgroundColor: '#ffffff !important',
			},
		},
	},
});

export default theme;

export const bootstrapColors = {
	muted: '#777777',
	primary: '#337AB7',
	success: '#3C763D',
	info: '#31708F',
	warning: '#8A6D3B',
	danger: '#A94442',
};

export const bootstrapBackgroundColors = {
	primary: '#337AB7',
	success: '#DFF0D8',
	info: '#D9EDF7',
	warning: '#FCF8E3',
	danger: '#F2DEDE',
};

export const themeConfig = {
	drawerWidth: 300,
};