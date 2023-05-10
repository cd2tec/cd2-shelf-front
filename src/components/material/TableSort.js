import React, { useState } from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';
import {
	Table, TableHead, TableCell, TableBody, TableRow,
	TableSortLabel, TableFooter, makeStyles, colors, Button, Dialog,
	DialogTitle, List, ListItem, DialogActions, ListItemIcon,
	Checkbox, ListItemText, IconButton, Tooltip,
} from '@material-ui/core';

import { Settings as SettingsIcon, ListAlt as XLSXAltIcon } from '@material-ui/icons';

import XLSX from 'xlsx';

import TablePagination from '../TablePagination';

const useStyles = makeStyles(() => ({
	table: {
		'& tfoot > tr > td': {
			backgroundColor: '#fafafa',
			color: 'rgba(0, 0, 0, 0.87)',
			fontWeight: 500,
			lineHeight: '1.5rem',
		},
		'& tbody > tr:hover > td': {
			backgroundColor: colors.grey[300],
		},
	},
	isStickyFooter: {
		'& tfoot > tr > td': {
			bottom: 0,
			left: 0,
			position: 'sticky',
			borderTop: '1px solid rgba(224, 224, 224, 1)',
		},
	},
	rowGroup: {
		'& > td': {
			fontWeight: 600,
		},
		backgroundColor: colors.grey[200],
	},
}))

const TableSortColumn = () => {
	return null;
}

TableSortColumn.propTypes = {
	field: PropTypes.string,
	title: PropTypes.string,
	width: PropTypes.any,
	padding: PropTypes.any,
	formatter: PropTypes.func,
}

const Row = ({ headCells, row, ...props }) => {
	const { onClick, style } = props;
	props.style = { cursor: onClick ? 'pointer' : 'auto', ...style };
	return (
		<TableRow
			{...props}
		>
			{headCells.map((h, k) => {
				const { field, formatter, align, padding, classBody, styleBody, rowSpanBody, colSpanBody } = h.props || {};
				let value = rawValue(field, row);
				// if(numeric && !value ) value = 0;
				if (formatter) value = formatter(value, row);
				let classesColumn = null;
				if (classBody) {
					if (typeof classBody === 'string') {
						classesColumn = classBody;
					}
					if (typeof classBody === 'function') {
						classesColumn = classBody(rawValue(field, row), row);
					}
				}
				if (!value === undefined || value === null) return null;
				return (
					<TableCell key={k} align={align}
						className={classesColumn}
						style={styleBody}
						colSpan={colSpanBody}
						rowSpan={rowSpanBody}
						padding={padding} >{value}</TableCell>
				);
			})}
		</TableRow>
	);
}

const GrupoRow = ({ grupo, groupBy, registros, headCells, renderGroup, ...props }) => {
	const classes = useStyles();
	const lista = registros.filter(r => rawValue(groupBy, r) === grupo.valor)
	const rowsGroup = lista.map((r, k) => (
		<Row
			key={k}
			headCells={headCells}
			row={r}
			{...props} />
	));

	return renderGroup
		? renderGroup(grupo, {
			colsCount: headCells.length,
			rowClassName: classes.rowGroup,
			rowsGroup: rowsGroup,
		})
		: (
			<React.Fragment>
				<TableRow className={classes.rowGroup}>
					<TableCell colSpan={headCells.length}>{grupo.descricao}</TableCell>
				</TableRow>
				{rowsGroup}
			</React.Fragment>
		);
}

const TableSort = (
	{
		rows = [],
		size = "medium",
		children = [],
		count,
		page,
		onChangePagination,
		stickyHeader = false,
		stickyFooter = false,
		footer,
		style,
		groups = [],
		groupBy,
		renderRow,
		renderGroup,
		configurable,
		exportable = true,
		onClick,
	}
) => {
	if (children && !Array.isArray(children)) {
		children = [children];
	}

	children = addChildrens(children);

	const classes = useStyles();
	let headCells = children.filter(c => !!c).map(({ props = {} }) => <HeadCell {...props} />);
	const [tableID] = useState(`table_${new Date().getTime()}`);
	const [orderBy, setOrderBy] = useState('');
	const [order, setOrder] = useState('asc');
	const [dialog, setDialog] = useState(false);
	const [colunas, setColuna] = useState([]);
	const handleRequestSort = (property) => (event) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};
	const descendingComparator = (a, b, orderBy) => {
		if (rawValue(orderBy, b) < rawValue(orderBy, a)) {
			return -1;
		}
		if (rawValue(orderBy, b) > rawValue(orderBy, a)) {
			return 1;
		}
		return 0;
	}
	const getComparator = (order, orderBy) => {
		return order === 'desc'
			? (a, b) => descendingComparator(a, b, orderBy)
			: (a, b) => -descendingComparator(a, b, orderBy);
	}
	const stableSort = (array, comparator) => {
		const stabilizedThis = array.map((el, index) => [el, index]);
		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0]);
			if (order !== 0) return order;
			return a[1] - b[1];
		});
		return stabilizedThis.map((el) => el[0]);
	}
	const rowsHead = [...new Set(headCells.map(a => {
		if (!a.props.rowNumber) return 1;
		return a.props.rowNumber;
	}))];

	const registros = stableSort(rows, getComparator(order, orderBy));

	const toggleColuna = (coluna, selecionar) => {
		if (selecionar) {
			setColuna([...colunas, coluna]);
		} else {
			setColuna(colunas.filter(p => p !== coluna));
		}
	}

	const fields = headCells;

	if (colunas.length) {
		headCells = headCells.filter((_, key) => !colunas.includes(key))
	}

	const exportToXLSX = () => {
		const filename = `tabela_${new Date().getTime()}.xlsx`;
		let wb = XLSX.utils.table_to_book(document.getElementById(tableID), {
			cellStyles: true,
			raw: true,
		});
		XLSX.writeFile(wb, filename);
	}

	return (
		<div className={classnames(classes.table, {
			[classes.isStickyFooter]: stickyFooter === true,
		})}>
			{configurable || exportable
				? (
					<div style={{ padding: 10, textAlign: 'right' }} >
						{exportable &&
							<React.Fragment>
								<Tooltip title="Gerar XLS" >
									<IconButton onClick={exportToXLSX} >
										<XLSXAltIcon />
									</IconButton>
								</Tooltip>
							</React.Fragment>}
						{configurable && <Tooltip title="Configurar tabela" >
							<IconButton onClick={() => setDialog(true)} >
								<SettingsIcon />
							</IconButton>
						</Tooltip>}
					</div>
				) : null}
			<Table size={size} stickyHeader={stickyHeader} style={style} id={tableID} >
				<TableHead>
					{rowsHead.map(row => {
						const rows = headCells.filter(h => {
							return (h.props.rowNumber || 1) === row;
						});
						return (
							<TableRow key={row} >
								{rows.map((h, k) => {
									let { field, title, align, width, disabled, padding, rowSpanHead, colSpanHead, classHead, styleHead } = h.props || {};
									if (!field && !title && !h.props.formatter) return null;
									return (
										<HeadCell
											key={k}
											className={classHead}
											field={field}
											title={title}
											align={align}
											width={width}
											order={order}
											orderBy={orderBy}
											handleRequestSort={handleRequestSort}
											disabled={disabled}
											padding={padding}
											rowSpan={rowSpanHead}
											colSpan={colSpanHead}
											style={styleHead}
										/>
									);
								})}
							</TableRow>
						);
					})}
				</TableHead>
				<TableBody>
					{!!groups.length && groups.map((g, k) => {
						return (
							<GrupoRow
								key={k}
								grupo={g}
								groupBy={groupBy}
								registros={registros}
								headCells={headCells}
								renderGroup={renderGroup} />
						);
					})}
					{!groups.length && registros.map((r, k) => {
						let props = {};
						if (onClick) {
							props.onClick = () => onClick(r)
						}
						if (renderRow) {
							props = renderRow({}, r);
						}
						return (<Row key={k} headCells={headCells} row={r} {...props} />);
					})}

				</TableBody>
				{!!footer && footer}
				{page && <TableFooter>
					<TableRow>
						<TablePagination colSpan={headCells.length}
							count={count}
							page={page.page}
							perPage={page.perPage}
							onChange={onChangePagination} />
					</TableRow>
				</TableFooter>}
			</Table>

			<Dialog open={dialog} fullWidth maxWidth="sm" >
				<DialogTitle>Visualização das Colunas</DialogTitle>
				<List dense >
					{(fields.map(h => h.props.title) || []).map((f, k) => {
						if (!f) return null;
						const checked = colunas.filter((key) => key === k).length;
						return (
							<ListItem key={k} >
								<ListItemIcon>
									<Checkbox
										onChange={() => toggleColuna(k, !checked)}
										checked={!checked}
									/>
								</ListItemIcon>
								<ListItemText primary={f} />
							</ListItem>
						);
					})}
				</List>
				<DialogActions>
					<Button onClick={() => setDialog(false)} color="primary">Fechar</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

function addChildrens(children) {
	let rs = [];
	for (let c of children) {
		if (Array.isArray(c)) {
			for (let novo of c) {
				const novo_c = novo.props.children;
				if (Array.isArray(novo_c)) {
					for (let nc of novo_c) {
						rs.push(nc);
					}
				} else {
					rs.push(novo);
				}
			}
		}
		if (typeof c === 'object' && !Array.isArray(c)) {
			rs.push(c);
		}
	}
	return rs;
}

function rawValue(field, row) {
	if (field) {
		if (field.split('.').length > 1) {
			return field.split('.').reduce((a, v) => {
				if (!a) return undefined;
				if (!a[v]) return undefined;
				return a[v];
			}, row);
		}
		return row[field];
	}
	return null;
}

const HeadCell = ({ field, title, align, width, order, orderBy, handleRequestSort,
	disabled, rowSpan, colSpan, className, style }) => {
	return (
		<TableCell
			sortDirection={orderBy === field ? order : false}
			style={{ width, ...style }}
			align={align}
			rowSpan={rowSpan}
			colSpan={colSpan}
			className={className}
		>
			<TableSortLabel active={orderBy === field}
				disabled={disabled || field === undefined}
				direction={orderBy === field ? order : 'asc'}
				onClick={handleRequestSort(field)} >
				{title}
			</TableSortLabel>
		</TableCell>
	);
}

TableSort.propTypes = {
	size: PropTypes.string,
	rows: PropTypes.array.isRequired,
	count: PropTypes.number,
	page: PropTypes.object,
	onChangePagination: PropTypes.func,
	stickyFooter: PropTypes.bool,
	stickyHeader: PropTypes.bool,
	footer: PropTypes.node,
	style: PropTypes.object,
	groups: PropTypes.array,
	groupBy: PropTypes.string,
	renderRow: PropTypes.func,
};

export {
	TableSort,
	TableSortColumn,
}