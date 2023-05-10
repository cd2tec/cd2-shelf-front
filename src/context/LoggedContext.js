import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { UsuarioAPI } from '../services/api';

const LoggedContext = React.createContext({
	usuario: null,
	entidade: null,
	entidades: [],
  permissoes: [],

	clearLoggedUser: () => { },
	reloadLoggedUser: async (isAdmin) => { },
});

export function LoggedContextProvider({ children }) {
	const navigate = useNavigate();
	const location = useLocation();

	const [firstCheck, setFirstCheck] = useState(false);
	const [loggedUser, setLoggedUser] = useState({
		usuario: null,
		entidade: null,
		entidades: [],
    permissoes: [],
		unidades: []
	});

	const reloadLoggedUser = async (isAdmin) => {
    let rs
		if (isAdmin) {
			rs = await UsuarioAPI.usuarioAdminLogado()
		} else {
			rs = await UsuarioAPI.usuarioLogado();
		}
		setLoggedUser({
      usuario: rs.usuario || null,
      entidade: rs.entidade || null,
      entidades: rs.entidades || [],
      permissoes: rs.permissoes || [],
			unidades: rs.unidades || []
    });
	}
	const clearLoggedUser = () => setLoggedUser({
		usuario: null,
		entidade: null,
		entidades: [],
    permissoes: []
	})

	useEffect(() => {
		if (location.pathname.includes('/admin')) {
			UsuarioAPI.usuarioAdminLogado()
				.then(rs => setLoggedUser({
					usuario: rs.usuario || null,
					entidade: rs.entidade || null,
					entidades: rs.entidades || [],
					permissoes: rs.permissoes || [],
					unidades: rs.unidades || []
				}))
				.catch(() => {
					if (['/', '/login', '/admin', '/admin/login'].indexOf(location.pathname) === -1) {
						navigate('/');
					}
				})
				.finally(() => setFirstCheck(true));
			return 
		}
		UsuarioAPI.usuarioLogado()
			.then(rs => setLoggedUser({
        usuario: rs.usuario || null,
        entidade: rs.entidade || null,
        entidades: rs.entidades || [],
        permissoes: rs.permissoes || [],
				unidades: rs.unidades || []
      }))
			.catch(() => {
				if (['/', '/login', '/admin', '/admin/login'].indexOf(location.pathname) === -1) {
					navigate('/');
				}
			})
			.finally(() => setFirstCheck(true));
	}, [navigate, location.pathname]);

	if (!firstCheck) return null;

	return (
		<LoggedContext.Provider value={{ ...loggedUser, reloadLoggedUser, clearLoggedUser }}>
			{children}
		</LoggedContext.Provider>
	)
}

export default LoggedContext;
