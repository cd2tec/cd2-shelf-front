import React, { useCallback, useEffect, useState } from 'react';
import {
	Dialog, DialogTitle, Step,
	Stepper, StepLabel, DialogContent,
	DialogActions, Button, Checkbox,
	makeStyles, Grid, FormControlLabel,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { TableSort, TableSortColumn } from '../../../components/material';

import { defaultProcessCatch, AcaoVendaAPI, CurvaAPI, AcaoVendaModelo } from '../../../services/api';
import { showLoading } from '../../../utils/loading';

const useStyles = makeStyles(() => ({
	row: {
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: 'rgba(0,0,0,0.05)',
		},
	},
}));

const DialogProdutos = ({ tipo, modelo = AcaoVendaModelo.ACAO, unidades, onClose, onSelect }) => {
	const classes = useStyles();
	const [produtos, setProdutos] = useState([]);
	const [step, setStep] = useState(0);
	const [selecionados, setSelecionado] = useState([]);
	const [loading, setLoading] = useState(true);
	const [curvas, setCurvas] = useState([]);
	const [showAllCurvas, setShowAllCurvas] = useState(modelo === AcaoVendaModelo.ACAO);
	const [categoriasCurvas, setCategoriasCurvas] = useState({});

	const categoriasToIgnore = curva => {
		const atual = categoriasCurvas[curva] || [];
		return processCategorias(curvas, categoriasCurvas).filter(c => {
			return !atual.find(cc => cc === c);
		})
	}

	const refreshProdutos = useCallback((curva, ignorarCategorias) => {
		showLoading(
			'Carregando lista de produtos...',
			AcaoVendaAPI.inicializarProdutos(
				{
					modelo,
					tipo_acao_uuid: tipo ? tipo.uuid : null,
					unidades_uuids: unidades.map(u => u.uuid),
					filtro: {
						curva: curva,
						categorias: ignorarCategorias,
					}

				})
				.finally(() => setLoading(false))
				.then(rs => setProdutos(rs.produtos || []))
				.catch(defaultProcessCatch()));
	}, [tipo, unidades, modelo]);

	useEffect(() => {
		CurvaAPI.list()
			.then(rs => rs.curvas || [])
			.then(curvas =>
				setCurvas(modelo === AcaoVendaModelo.RECUPERACAO && !showAllCurvas
					? curvas.filter(curva => ['A', 'B'].indexOf(curva.letra) > -1)
					: curvas))
			.catch(defaultProcessCatch());
	}, [modelo, showAllCurvas]);

	useEffect(() => {
		refreshProdutos('A');
	}, [refreshProdutos]);

	const changeStep = step => {
		const curva = curvas[step].letra;
		setStep(step);
		refreshProdutos(curva, categoriasToIgnore(curva));
	}

	const nextStep = lastStep => {
		if (lastStep) {
			onSelect(selecionados);
			onClose();
			return;
		}
		changeStep(step + 1);
	}

	const previousStep = () => changeStep(step - 1);

	const toggleSelecionado = (produto, selecionar) => {
		const curva = curvas[step].letra;
		const categoriaUUID = produto.categoria.uuid;
		let cc = categoriasCurvas;
		if (selecionar) {
			if (!!cc[curva]) {
				if (!cc[curva].find(c => c === categoriaUUID)) cc[curva].push(categoriaUUID);
			} else {
				cc = { ...categoriasCurvas, [curva]: [categoriaUUID] }
			}
			setCategoriasCurvas(cc)
			setSelecionado([...selecionados, produto]);
		} else {
			// cc =
			setCategoriasCurvas({ ...categoriasCurvas, [curva]: cc[curva].filter(c => c !== categoriaUUID) })
			setSelecionado(selecionados.filter(p => p.uuid !== produto.uuid));
		}
	}

	if (!curvas.length) return null;
	const curva = curvas[step];
	const info = (tipo.margens_curvas || {})[curva.letra] || {};

	return (
		<Dialog open={true} fullWidth maxWidth="lg">
			<DialogTitle>
				<Grid container>
					<Grid item xs={6}>Inicialização de Produtos</Grid>
					<Grid item xs={6} style={{ textAlign: 'right' }}>
						{modelo === AcaoVendaModelo.RECUPERACAO
							? (
								<FormControlLabel
									control={
										<Checkbox
											checked={showAllCurvas}
											onChange={() => setShowAllCurvas(!showAllCurvas)} />
									}
									label="Mostrar todas curvas" />
							)
							: null}
					</Grid>
					<Grid item xs={12}>
						<Stepper activeStep={step}>
							{curvas.map((c, index) => (
								<Step key={index}>
									<StepLabel>Curva {c.letra}</StepLabel>
								</Step>
							))}
						</Stepper>
					</Grid>
				</Grid>
			</DialogTitle>

			<DialogContent>
				{modelo === AcaoVendaModelo.ACAO ? (
					<Alert severity="info">
						Atenção — Nesta curva é indicado você selecionar no mínimo
						{' '}
						<strong>{info.quantidade_itens}</strong>
						{' '}
						{info.quantidade_itens > 1 ? 'produtos' : 'produto'}
					</Alert>
				) : null}

				<TableSort size="small" rows={produtos.filter(p => p.curvas.venda === curva.letra)}
					renderRow={(row, dados) => {
						row.className = classes.row;
						return row;
					}}
				>
					<TableSortColumn field="" title="" width={60} padding="checkbox"
						formatter={(_, p) => {
							const checked = !!selecionados.filter(s => s.uuid === p.uuid).length;
							return <Checkbox
								checked={checked}
								onChange={() => toggleSelecionado(p, !checked)} />
						}}
					/>
					<TableSortColumn field="codigo" title="Código" width={160} />
					<TableSortColumn field="codigo_barra" title="Código Barra" width={160} />
					<TableSortColumn field="descricao" title="Descrição" />
					<TableSortColumn field="departamento.nome" title="Departamento" />
					<TableSortColumn field="categoria.nome" title="Categoria" />
				</TableSort>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button onClick={previousStep} variant="outlined" disabled={!step} color="primary">Anterior</Button>
				<Button onClick={() => nextStep(step === curvas.length - 1)}
					variant="outlined"
					disabled={loading}
					color="primary">
					{step === curvas.length - 1 ? 'Concluir' : 'Próximo'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default DialogProdutos;

function processCategorias(curvas, categorias) {
	let rs = [];
	for (let cc of curvas) {
		if (categorias[cc.letra]) {
			for (const c of categorias[cc.letra]) {
				rs.push(c);
			}
		}
	}
	if (!!rs.length) {
		rs = [...new Set(rs.map(s => s))]
	}

	return rs;
}