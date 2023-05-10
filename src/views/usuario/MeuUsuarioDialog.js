import React, { useContext, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@material-ui/core";
import { TextField } from "../../components/material";
import LoggedContext from "../../context/LoggedContext";
import AlterarSenhaDialog from "./AlterarSenhaDialog";

export default function MeuUsuarioDialog({ onClose }) {
	const { usuario } = useContext(LoggedContext);
	const [dialog, setDialog] = useState();

	const handleClose = () => onClose()
	const handleAlterarSenha = () => setDialog(
		<AlterarSenhaDialog
			onClose={() => setDialog()} />
	)

	return (
		<React.Fragment>
			<Dialog open={true} fullWidth={true} maxWidth="sm" onClose={handleClose}>
				<DialogTitle>Meu Usuário</DialogTitle>
				<DialogContent>
					<Grid container={true} spacing={2}>
						<Grid item={true} xs={6}>
							<TextField
								disabled={true}
								label="Nome"
								value={usuario.nome} />
						</Grid>
						<Grid item={true} xs={6}>
							<TextField
								disabled={true}
								label="Sobrenome"
								value={usuario.sobrenome} />
						</Grid>
						<Grid item={true} xs={12}>
							<TextField
								disabled={true}
								label="E-mail"
								value={usuario.email} />
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={handleAlterarSenha}>Alterar Senha</Button>
					<Button style={{ marginLeft: 'auto' }} onClick={handleClose}>Fechar</Button>
				</DialogActions>
			</Dialog>

			{dialog}
		</React.Fragment>
	);
}