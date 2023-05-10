import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
	Chip, Dialog, DialogActions, DialogTitle,
	IconButton, makeStyles, Table, TableCell, TableHead,
	Typography, TableRow, Checkbox, TableBody, Button, DialogContent
} from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';

import { AcaoVendaAPI, defaultProcessCatch, acaoVendaStatusText } from '../../services/api';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		border: '1px solid rgba(0, 0, 0, 0.23)',
		borderRadius: 4,
		padding: '5px',
		marginTop: theme.spacing(1.5),
	},
	selecteds: {
		'&> *': {
			margin: theme.spacing(0.5),
			fontSize: '1rem',
			top: 3,
			position: 'relative',
		},
	},
	placeHolder: {
		opacity: '0.4',
		fontSize: '1.2rem',
		position: 'relative',
		top: 5,
		userSelect: 'none',
		MozUserSelect: 'none',
	}
}))

const DialogFilterAcoes = ({ filtro, selectOne, defaultAcoes = [], onCancel, onOK }) => {
	const [acoes, setAcoes] = useState([]);
	const [selecionados, setSelecionados] = useState(defaultAcoes);

	useEffect(() => {
		setSelecionados(defaultAcoes);
	}, [defaultAcoes]);

	useEffect(() => {
		AcaoVendaAPI.list()
			.then(rs => setAcoes((rs.acoes || []).filter(filtro)))
			.catch(defaultProcessCatch());
	}, [filtro]);

	return (
		<Dialog open={true} fullWidth maxWidth="md">
			<DialogTitle>Pesquisar ações</DialogTitle>
			<DialogContent style={{ padding: 0 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox"></TableCell>
							<TableCell>Nome</TableCell>
							<TableCell>Validade</TableCell>
							<TableCell>Tipo</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{acoes.map((a, index) => {
							const selecionado = selecionados.filter(s => s.uuid === a.uuid).length > 0;

							return (
								<TableRow key={index}>
									<TableCell padding="checkbox">
										<Checkbox
											checked={selecionado}
											onChange={() => {
												if (selectOne) {
													onOK([a]);
													return;
												}
												setSelecionados(
													selecionado
														? selecionados.filter(v => v.uuid !== a.uuid)
														: [...selecionados, a]
												);
											}} />
									</TableCell>
									<TableCell>{a.nome}</TableCell>
									<TableCell>
										{moment(a.validade_inicio, 'YYYY-MM-DD').format('DD/MM/YYYY')}
										{' até '}
										{moment(a.validade_fim, 'YYYY-MM-DD').format('DD/MM/YYYY')}
									</TableCell>
									<TableCell>{a.tipo.nome}</TableCell>
									<TableCell>{acaoVendaStatusText(a.status)}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancelar</Button>
				{!selectOne && <Button onClick={() => onOK(selecionados)}>OK</Button>}
			</DialogActions>
		</Dialog>
	);
}

const SearchAcaoField = ({
	selectOne = false,
	value, onChange,
	renderChipLabel = a => a.nome,
	filtro = () => true
}) => {
	const classes = useStyles();
	const [open, setOpen] = useState(null);
	const [selecionados, setSelecionados] = useState();
	const [values, setValues] = useState([]);

	useEffect(() => {
		setValues(selectOne
			? (value ? [value] : [])
			: (value || []));
	}, [selectOne, value]);

	useEffect(() => {
		setSelecionados(open ? values : []);
	}, [values, open]);

	return (
		<React.Fragment>
			<div className={classes.root}>
				<IconButton onClick={() => setOpen(true)}>
					<SearchIcon />
				</IconButton>
				<div className={classes.selecteds}>
					{!values.length && (
						<Typography variant="body1" className={classes.placeHolder}>
							{selectOne ? 'Selecione uma ação' : 'Selecione as ações'}
						</Typography>
					)}
					{values.map((a, k) => (
						<Chip
							key={k}
							color="primary"
							variant="outlined"
							label={renderChipLabel(a)}
							onDelete={() => onChange(selectOne ? null : values.filter(v => v.uuid !== a.uuid))} />
					))}
				</div>
			</div>

			{open ? (
				<DialogFilterAcoes
					filtro={filtro}
					selectOne={selectOne}
					defaultAcoes={selecionados}
					onCancel={() => setOpen(false)}
					onOK={selecionados => {
						setOpen(false);
						onChange(selectOne ? selecionados[0] : selecionados);
					}} />
			) : null}
		</React.Fragment>
	);
}

export default SearchAcaoField;