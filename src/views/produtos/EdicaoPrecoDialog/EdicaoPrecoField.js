import React, { useState, useEffect, useCallback } from 'react';

import { InputAdornment, IconButton, Tooltip, makeStyles, CircularProgress } from '@material-ui/core';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

import { NumberField } from '../../../components/material';
import { defaultProcessCatch, FluxoAPI } from '../../../services/api';
import alerts from '../../../utils/alerts';
import EdicaoPrecoDialog from './EdicaoPrecoDialog';

const useStyles = makeStyles(
	{
		oferta: {
			'& .MuiInputBase-input': {
				color: 'red',
				width: '40px'
			},
		}
	},
);

const CustomTextField = ({
	disabled,
	value,
	onChange,
	errorText,
	showOfertaIcon = false,
	isOferta,
	handleProdutoOferta,
	customLeftEndIcon,
}) => {
	const classes = useStyles();
	const [internalValue, setInternalValue] = useState(value);

	useEffect(() => {
		setInternalValue(value);
	}, [value]);

	const handleChange = v => {
		if (v === '') v = null;
		if (v === value) return;
		onChange(v);
	}

	return (
		<NumberField
			disabled={disabled}
			errorText={errorText}
			variant="standard"
			margin="none"
			className={isOferta ? classes.oferta : undefined}
			style={{ minWidth: 130 }}
			value={internalValue}
			onChange={v => setInternalValue(v)}
			onKeyPress={ev => {
				const keyCode = ev.which || ev.keyCode;
				if (keyCode === 13) handleChange(internalValue);
			}}
			onBlur={() => handleChange(internalValue)}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						R$
					</InputAdornment>
				),
				endAdornment: showOfertaIcon ? (
					<InputAdornment position="end">
						{customLeftEndIcon ? customLeftEndIcon(v => handleChange(v)) : null}
						<IconButton onClick={handleProdutoOferta} style={{ padding: 0 }}>
							<Tooltip title="Visualizar Produto" position="to" placement="top" >
								<LocalOfferIcon color={isOferta ? `secondary` : undefined} />
							</Tooltip>
						</IconButton>
					</InputAdornment>
				) : null,
			}} />
	);
}

const EdicaoPrecoField = ({
	produtoUUID,
	fluxoUUID,
	unidadeUUID,
	onChange,
	customLeftEndIcon,
	errorText,
	showOferta,
	disabled,
}) => {
	const [loading, setLoading] = useState(true);
	const [indisponivel, setIndisponivel] = useState(true);
	const [preco, setPreco] = useState();
	const [oferta, setOferta] = useState();
	const [dialog, setDialog] = useState();

	const reloadPreco = useCallback(callOnChange => {
		setLoading(true);

		FluxoAPI.getProdutoFluxo(fluxoUUID, produtoUUID)
			.finally(() => setLoading(false))
			.then(rs => {
				const unidade = (rs.unidades || []).find(u => u.unidade.uuid === unidadeUUID);
				if (!unidade) return;

				const valor = showOferta && unidade.produto.oferta
					? unidade.produto.oferta.valor
					: unidade.produto.preco1.valor

				setPreco(valor);
				setOferta(unidade.produto.oferta.ativo === true);
				setIndisponivel(false);
				if (callOnChange) {
					onChange(valor);
				}
			})
			.catch(defaultProcessCatch());
	}, [onChange, produtoUUID, fluxoUUID, unidadeUUID, showOferta]);

	useEffect(() => {
		reloadPreco();
	}, [reloadPreco, produtoUUID, fluxoUUID, unidadeUUID]);

	const openDialogProduto = () => setDialog(
		<EdicaoPrecoDialog
			fluxoUUID={fluxoUUID}
			produtoUUID={produtoUUID}
			unidadeUUID={unidadeUUID}
			closeOnSave={true}
			onClose={hasChanges => {
				if (hasChanges) reloadPreco(true);
				setDialog();
			}} />
	)

	const handleChange = value => {
		FluxoAPI.updateProduto(
			fluxoUUID,
			produtoUUID,
			{
				unidades: [
					{
						unidade_uuid: unidadeUUID,
						update: showOferta
							? {
								oferta: {
									valor: value,
								},
							}
							: {
								preco1: {
									valor: value,
								},
							},
					}
				],
				update_mask: { paths: [showOferta ? 'oferta.valor' : 'preco1.valor'] }
			})
			.then(() => {
				alerts.snackbars.success('Alterações salvas com sucesso.');
				reloadPreco(true);
			})
			.catch(defaultProcessCatch());
	}

	if (indisponivel) return 'loading...';
	if (dialog) return dialog;

	return (
		<CustomTextField
		disabled={disabled}
			showOfertaIcon
			value={preco}
			isOferta={oferta}
			handleProdutoOferta={() => openDialogProduto()}
			onChange={value => handleChange(value)}
			customLeftEndIcon={setValue => {
				return (
					<React.Fragment>
						{loading && !disabled ? <CircularProgress size={20} /> : null}
						{customLeftEndIcon && !disabled ? customLeftEndIcon(setValue) : null}
					</React.Fragment>
				);
			}}
			errorText={errorText} />
	);
}

export default EdicaoPrecoField;