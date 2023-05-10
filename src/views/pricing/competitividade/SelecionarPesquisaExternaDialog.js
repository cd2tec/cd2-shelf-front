import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";

import { defaultProcessCatch, PesquisaAPI } from "../../../services/api";
import { TableSort, TableSortColumn } from "../../../components/material";

export default function SelecionarPesquisaExternaDialog({ onClose, onSelect }) {
	const [pesquisas, setPesquisas] = useState([]);

	const handleClose = () => onClose()

	useEffect(() => {
		PesquisaAPI.listPesquisasExternas()
			.then(rs => setPesquisas(rs.pesquisas || []))
			.catch(defaultProcessCatch());
	}, []);

	return (
		<Dialog open={true} fullWidth={true} maxWidth="sm" onClose={handleClose}>
			<DialogTitle>Selecionar pesquisa realizada</DialogTitle>

			<DialogContent style={{ padding: 0 }}>
				<TableSort rows={pesquisas} stickyHeader={true} onClick={pesquisa => onSelect(pesquisa)}>
					<TableSortColumn
						field="data"
						title="Data"
						formatter={v => moment(v, 'YYYY-MM-DD').format('DD/MM/YYYY')} />
					<TableSortColumn field="produtos_count" title="Qtd. Produtos" />
					<TableSortColumn field="concorrentes_count" title="Qtd. Concorrentes" />
				</TableSort>
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose}>Fechar</Button>
			</DialogActions>
		</Dialog>
	);
}