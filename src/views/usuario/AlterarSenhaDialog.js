import React, { useCallback, useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@material-ui/core";
import { TextField } from "../../components/material";
import { defaultProcessCatch, Errors, filterErrors, UsuarioAPI } from "../../services/api";
import alerts from "../../utils/alerts";

export default function AlterarSenhaDialog({ onClose }) {
	const [senhaAtual, setSenhaAtual] = useState('');
	const [novaSenha, setNovaSenha] = useState('');
	const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
	const [errors, setErrors] = useState();

	useEffect(() => {
		setErrors(() => null);
	}, [senhaAtual, novaSenha, confirmacaoNovaSenha]);

	const validate = useCallback(isSubmit => {
		let errors = new Errors();

		if (isSubmit && !senhaAtual) {
			errors.addRequiredField('senhaAtual');
		}

		if (novaSenha || confirmacaoNovaSenha) {
			if (novaSenha !== confirmacaoNovaSenha) {
				errors.addFieldViolation('confirmacaoNovaSenha', 'Confirmação de nova senha incorreta');
			}
		} else if (isSubmit) {
			errors.addRequiredField('novaSenha');
			errors.addRequiredField('confirmacaoNovaSenha');
		}

		setErrors(errors);
		return !errors.hasErrors();
	}, [senhaAtual, novaSenha, confirmacaoNovaSenha])

	const handleClose = () => onClose()
	const handleAlterarSenha = () => {
		if (!validate(true)) {
			return;
		}

		UsuarioAPI.alterarSenha({ senha_atual: senhaAtual, nova_senha: novaSenha })
			.then(() => {
				alerts.snackbars.success('Senha alterada com sucess!');
				handleClose();
			})
			.catch(() => defaultProcessCatch(errors => setErrors(errors)));
	}

	return (
		<Dialog open={true} fullWidth={true} maxWidth="sm" onClose={handleClose}>
			<DialogTitle>Alteração de Senha</DialogTitle>
			<DialogContent>
				<Grid container={true} spacing={2}>
					<Grid item={true} xs={12}>
						<TextField
							type="password"
							label="Senha atual"
							value={senhaAtual}
							onChange={v => setSenhaAtual(v)}
							errorText={filterErrors(errors, 'senhaAtual')} />
					</Grid>
					<Grid item={true} xs={12}>
						<TextField
							type="password"
							label="Nova senha"
							value={novaSenha}
							onChange={v => setNovaSenha(v)}
							errorText={filterErrors(errors, 'novaSenha')} />
					</Grid>
					<Grid item={true} xs={12}>
						<TextField
							type="password"
							label="Confirmar a nova senha"
							value={confirmacaoNovaSenha}
							onChange={v => setConfirmacaoNovaSenha(v)}
							errorText={filterErrors(errors, 'confirmacaoNovaSenha')} />
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>Fechar</Button>
				<Button color="primary" onClick={handleAlterarSenha}>Alterar Senha</Button>
			</DialogActions>
		</Dialog>
	);
}