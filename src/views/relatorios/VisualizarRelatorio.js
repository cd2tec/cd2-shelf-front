import React, { useCallback, useEffect, useState } from 'react';

import {
	Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, LinearProgress, Typography, MenuItem,
} from '@material-ui/core';

import { PictureAsPdf as PDFIcon, Receipt as XLSIcon } from '@material-ui/icons';

import { defaultProcessCatch, downloadBlob, filterErrors } from '../../services/api';
import { SelectField, TableSort, TableSortColumn } from '../../components/material';
import { showLoading } from '../../utils/loading';

function Table({ columns = [], rows = [] }) {
	const [page, setPage] = useState({
		perPage: 100,
		page: 1,
	});

	const index = (page.page - 1) * page.perPage;
	return (
		<TableSort
			stickyHeader={true}
			stickyFooter={true}
			size="small"
			rows={
				rows.slice(index, index + page.perPage)
					.map(r => (r.values || []).reduce((obj, item, index) => ({
						...obj,
						[`field${index}`]: item,
					}), {}))
			}
			page={page}
			onChangePagination={setPage}
			count={rows.length}>
			{columns.map((c, index) => (
				<TableSortColumn key={index} field={`field${index}`} title={c.title} />
			))}
		</TableSort>
	);
}

function VisualizarRelatorio({ relatorio: { title, modulo, area }, api, filtros = [], onClose }) {
	const [loading, setLoading] = useState(false);
	const [relatorio, setRelatorio] = useState();
	const [errors, setErrors] = useState();
	let [filtro, setFiltro] = useState({});

	// ativar opcao de selecionar colunas visiveis no relatorio
	const refresh = useCallback((filtro = {}) => {
		setLoading(true);
		setErrors();
		showLoading(
			'Gerando relatório...',
			api(filtro)
				.finally(() => setLoading(false))
				.then(rs => setRelatorio(rs))
				.catch(defaultProcessCatch(errors => setErrors(errors))));
	}, [api]);

	const download = useCallback((mode, filtro = {}) => {
		setLoading(true);
		setErrors();
		showLoading(
			`Gerando relatório ${`${mode}`.toUpperCase()}...`,
			api({ ...filtro, output: mode })
				.finally(() => setLoading(false))
				.then(rs => downloadBlob(rs))
				.catch(defaultProcessCatch(errors => setErrors(errors))));
	}, [api]);

	const handleRefresh = () => refresh(filtro)
	const handleDownload = mode => download(mode, filtro)

	useEffect(() => {
		if (filtros.length) return;
		refresh();
	}, [refresh, filtros.length]);

	const onChangeFiltro = (field, value) => {
		filtro = { ...filtro, [field]: value };
		setFiltro(filtro);
		refresh(filtro);
	}

	const renderTable = ({ columns = [], rows = [] }) => {
		return <Table columns={columns} rows={rows} />;
	}

	const renderRow = ({ value } = {}) => {
		switch (value['@type']) {
			case 'unitrier.Relatorio.Table':
				return renderTable(value);
			default:
				return null;
		}
	}

	const renderFiltros = filtros => {
		return (
			<div style={{ paddingRight: 8 }}>
				<Grid container spacing={1} justify="flex-end">
					{filtros.map((f, index) => (
						<Grid key={index} item xs={2}>
							<SelectField
								label={f.label}
								value={filtro[f.field]}
								onChange={v => onChangeFiltro(f.field, v)}
								errorText={filterErrors(errors, f.field)}>
								{(f.values || []).map((v, index) => (
									<MenuItem key={index} value={v.value}>
										{v.description}
									</MenuItem>
								))}
							</SelectField>
						</Grid>
					))}

					<Grid item xs={1} style={{ display: 'flex' }}>
						<Button variant="outlined" color="primary" onClick={handleRefresh} style={{ margin: 'auto' }}>
							Gerar
						</Button>
					</Grid>
				</Grid>
			</div>
		);
	}

	return (
		<Dialog open={true} fullScreen={true}>
			<DialogTitle>
				{title}
				<Typography>{modulo}{area ? ` > ${area}` : null}</Typography>
			</DialogTitle>

			<DialogContent style={{ padding: 0 }}>
				{(filtros || []).length ? renderFiltros(filtros || []) : null}
				{loading ? <LinearProgress /> : null}
				{relatorio && relatorio.rows
					? relatorio.rows.map((v, key) => (
						<div key={key}>{renderRow(v)}</div>
					))
					: null}
			</DialogContent>

			<DialogActions>
				<Button color="primary" startIcon={<PDFIcon />} onClick={() => handleDownload('PDF')}>Gerar PDF</Button>
				<Button color="primary" startIcon={<XLSIcon />} onClick={() => handleDownload('XLS')}>Gerar XLS</Button>

				<Button onClick={onClose} style={{ marginLeft: 'auto' }}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default VisualizarRelatorio;