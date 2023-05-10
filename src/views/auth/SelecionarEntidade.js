import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogTitle, DialogActions, List, ListItem, ListItemText, ListItemAvatar } from '@material-ui/core';
import LocationCity from '@material-ui/icons/LocationCity';

import { UsuarioAPI, defaultProcessCatch } from '../../services/api';
import { setEntidade } from '../../services/session';
import alerts from '../../utils/alerts';
import LoggedContext from '../../context/LoggedContext';

export default function SelecionarEntidade({ onClose }) {
	const { entidade, reloadLoggedUser } = useContext(LoggedContext);

	const navigate = useNavigate();
	const [entidades, setEntidades] = useState([]);

	const selecionarEntidade = useCallback(async entidade => {
		setEntidade(entidade.uuid);
		await reloadLoggedUser();
		navigate('/app', { replace: true });
		onClose();
	}, [navigate, onClose, reloadLoggedUser]);

	useEffect(() => {
		UsuarioAPI.usuarioLogado()
			.then(rs => rs.entidades || [])
			.then(entidades => {
				if (!entidades.length) {
					alerts.snackbars.warning('Seu usuário não está vinculado a nenhuma empresa.');
					onClose();
					return;
				}
				if (entidades.length === 1) {
					selecionarEntidade(entidades[0]);
					return;
				}

				setEntidades(entidades);
			})
			.catch(defaultProcessCatch());
	}, [selecionarEntidade, onClose]);

	if (!entidades.length) return null;

	return (
		<Dialog maxWidth="sm" fullWidth open onClose={() => onClose()}>
			<DialogTitle>Acessar Empresa</DialogTitle>

			<List>
				{entidades.map(e => {
					const selected = entidade && entidade.uuid === e.uuid;
					return (
						<ListItem
							key={e.uuid}
							button={!selected}
							selected={selected}
							onClick={() => selecionarEntidade(e)}>
							<ListItemAvatar>
								<LocationCity />
							</ListItemAvatar>
							<ListItemText
								primary={e.nome}
								secondary={selected ? 'Selecionado' : undefined} />
						</ListItem>
					);
				})}
			</List>

			<DialogActions>
				<Button onClick={() => onClose()}>Cancelar</Button>
			</DialogActions>
		</Dialog>
	);
}