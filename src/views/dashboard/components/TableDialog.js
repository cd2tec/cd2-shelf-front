import React, { useEffect, useState } from 'react';

import {
	Dialog, DialogContent, Button, DialogTitle, DialogActions,
} from '@material-ui/core';

import { defaultProcessCatch } from '../../../services/api';
import { TableSort, TableSortColumn } from '../../../components/material/TableSort';
import showLoading from '../../../utils/loading';

const TableDialog = ({
	promise,
	promiseParams,
	title,
	fields,
	maxWidth = 'lg',
	onClick,
	onClose,
}) => {
	const [dialog, setDialog] = useState(null);
	const [data, setData] = useState([]);
	const [columnsReference, setColumnsReference] = useState({});

	useEffect(() => {
		showLoading(
			'Carregando informações...',
			promise({ ...promiseParams, detalhado: true }).then(rs => {
				if (!rs.data) return;
				if (!rs.data.fields) return;
				if (!rs.data.values) return;
				const { fields, values } = rs.data;

				let ref = {}
				for (let f in fields) {
					ref[fields[f]] = f;
				}

				setColumnsReference(ref);
				setData(values.map(v => v.values));
			}).catch(defaultProcessCatch()));
	}, [promise, promiseParams]);

	const getRows = () => {
		let rows = [];
		for (const r of data) {
			let row = {};
			for (const field in columnsReference) {
				row[field] = r[columnsReference[field]];
			}
			rows.push(row);
		}
		return rows;
	}

	return (
		<React.Fragment>
			<Dialog open={true} maxWidth={maxWidth} fullWidth onClose={onClose}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent style={{ padding: 0 }}>
					<TableSort
						rows={getRows()}
						stickyHeader={true}
						onClick={
							onClick
								? row => onClick({
									data: row,
									obj: row,
								}, { setDialog })
								: undefined
						}>
						{fields.map((f, index) => (
							<TableSortColumn
								key={index}
								field={f.name}
								title={f.title}
								align={f.align}
								formatter={f.format ? v => f.format(v) : undefined} />
						))}
					</TableSort>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Fechar</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}

export default TableDialog;