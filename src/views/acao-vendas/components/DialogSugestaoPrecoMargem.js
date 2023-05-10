import React, { useEffect, useState } from 'react';
import {
	Button, Dialog, DialogActions, DialogContent, DialogTitle,
	Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { DECIMAIS, numberFormat } from '../../../utils/formats';
import { AcaoVendaAPI, defaultProcessCatch } from '../../../services/api';

const DialogSugestaoPrecoMargem = ({ tipoAcao, produto, onClose, onChangeValorProduto }) => {
	const [margens, setMargens] = useState(null);

	useEffect(() => {
		AcaoVendaAPI.calcularSugestaoPreco(tipoAcao.uuid,
			{
				unidade_uuid: produto.unidade.unidade.uuid,
				produto_uuid: produto.uuid
			})
			.then(rs => {
				setMargens([
					{
						margem: 'Mínima',
						percentual: rs.minimo.percentual,
						sugestao_preco: rs.minimo.valor,
					},
					{
						margem: 'Média',
						percentual: rs.medio.percentual,
						sugestao_preco: rs.medio.valor,
					},
					{
						margem: 'Máxima',
						percentual: rs.maximo.percentual,
						sugestao_preco: rs.maximo.valor,
					},
				]);
			})
			.catch(defaultProcessCatch());
	}, [tipoAcao, produto, onClose]);

	if (!margens) return null;

	return (
		<Dialog fullWidth maxWidth="sm" open={true} >
			<DialogTitle disableTypography >
				<Typography variant="h6" >{produto.descricao}</Typography>
				<Typography variant="subtitle1" >Preço sugerido por margem</Typography>
			</DialogTitle>
			<DialogContent>
				<Alert severity="info">
					Preço de Compra:
					{' '}
					<strong>R$ {numberFormat(produto.unidade.preco_compra, DECIMAIS.VALOR)}</strong>
				</Alert>

				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Margem</TableCell>
							<TableCell>Percentual</TableCell>
							<TableCell>Sugestão de Preço</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{margens.map((m, k) => (
							<TableRow key={k} >
								<TableCell>{m.margem}</TableCell>
								<TableCell align="right" >{numberFormat(m.percentual, DECIMAIS.PERCENTUAL)}%</TableCell>
								<TableCell align="right" >R$ {numberFormat(m.sugestao_preco, DECIMAIS.VALOR)}</TableCell>
								<TableCell>
									<Button variant="outlined" color="secondary" onClick={() => {
										onChangeValorProduto(produto, {
											preco_acao: m.sugestao_preco,
											margem_acao: null,
											calculando: true,
										});
										onClose();
									}} >Selecionar Preço</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DialogSugestaoPrecoMargem;