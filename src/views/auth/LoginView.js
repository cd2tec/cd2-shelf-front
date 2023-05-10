import React, { useContext, useEffect, useState } from 'react';
import cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import { Box, makeStyles, Container, Typography, Button, Card, DialogContent } from '@material-ui/core';

import { EmailOutlined as EmailIcon } from '@material-ui/icons';

import Page from '../../components/Page';
import { TextField, Form } from '../../components/material';
import {
	UsuarioAPI, AuthenticateUsuarioRequestGrantType,
	defaultProcessCatch, filterErrors,
} from '../../services/api';
import { clearAuthToken, setAccessToken } from '../../services/session';
import SelecionarEntidade from './SelecionarEntidade';
import LoggedContext from '../../context/LoggedContext';

import { Shelf } from '../../assets/logos';

const useStyles = makeStyles(({ spacing }) => ({
	root: {
		backgroundColor: '#d1d3d4',
		height: '100%',
		paddingBottom: spacing(3),
		paddingTop: spacing(3)
	}
}));

export default function LoginView() {
	const classes = useStyles();
	const navigate = useNavigate();
	const loggedContext = useContext(LoggedContext);
	const [dialog, setDialog] = useState();
	const [errors, setErrors] = useState();
	const [email, setEmail] = useState(cookie.get('last-logged-email'));
	const [senha, setSenha] = useState('');
	const focusPassword = !!cookie.get('last-logged-email');

	useEffect(() => {
		if (!loggedContext.usuario) return;
		navigate('/app');
	}, [navigate, loggedContext.usuario]);

	const submit = () => {
		setErrors();
		UsuarioAPI.authenticate({ usuario: email, senha, grant_type: AuthenticateUsuarioRequestGrantType.PASSWORD })
			.then(rs => {
				cookie.set('last-logged-email', email);
				clearAuthToken();
				setAccessToken(rs.access_token, rs.refresh_token);
				setDialog(<SelecionarEntidade onClose={() => setDialog()} />);
			})
			.catch(defaultProcessCatch(setErrors));
	}

	return (
		<Page className={classes.root} title="Login" showWatermark>
			<Box display="flex"
				flexDirection="column"
				height="100%"
				justifyContent="center">
				<Container maxWidth="sm">
					<Card>
						<DialogContent style={{ padding: '32px 80px' }}>
							<Typography color="textPrimary" variant="h2" align="center">
								Login
							</Typography>

							<Shelf width="80%" />

							<Typography color="textSecondary" gutterBottom variant="body2" style={{ marginTop: 12 }}>
								Faça login para ter acesso a plataforma
							</Typography>

							<Button fullWidth startIcon={<EmailIcon />} size="large" variant="contained">
								Entrar com Google
							</Button>

							<Box mt={3} mb={1}>
								<Typography align="center" color="textSecondary" variant="body1">
									ou fazer login com o endereço de email
								</Typography>
							</Box>

							<Form onSubmit={submit}>
								<TextField
									autoFocus={!focusPassword}
									type="email"
									label="Endereço de E-mail"
									value={email}
									onChange={setEmail}
									errorText={filterErrors(errors, 'usuario')} />

								<TextField
									autoFocus={focusPassword}
									type="password"
									label="Senha"
									value={senha}
									onChange={setSenha}
									errorText={filterErrors(errors, 'senha')} />

								<Box my={2}>
									<Button
										fullWidth
										color="primary"
										size="large"
										type="submit"
										variant="contained">
										Entrar
                  					</Button>
								</Box>
							</Form>
						</DialogContent>
					</Card>
				</Container>
			</Box>

			{dialog}
		</Page>
	);
}