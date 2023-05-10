import React, { useState } from 'react';
import { TableRow, TableCell, IconButton } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import CellsProduto from './CellsProduto';

const RowProduto = ({
	classes,
	produto,
	unidade,
	concorrentes,
	outrasUnidades,
	onChangePrecoVenda,
	onToggle,
	valoresConcorrentes,
	openOfertaProduto,
}) => {
	const [expanded, setExpanded] = useState(false);

	const handleExpand = () => {
		const v = !expanded;
		setExpanded(v);
		onToggle(v);
	}

	return (
		<React.Fragment>
			<TableRow>
				{outrasUnidades.length ? (
					<TableCell>
						<IconButton size="small" onClick={handleExpand}>
							{expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					</TableCell>
				) : null}

				<CellsProduto
					classes={classes}
					produto={produto}
					unidade={unidade}
					concorrentes={concorrentes}
					onChangePrecoVenda={onChangePrecoVenda}
					valoresConcorrentes={valoresConcorrentes}
					openOfertaProduto={openOfertaProduto} />
			</TableRow>

			{expanded ? (
				outrasUnidades.map((ou, index) => (
					<TableRow key={index} className={classes.rowExpanded}>
						<TableCell>{ou.unidade.nome}</TableCell>

						<CellsProduto
							classes={classes}
							produto={produto}
							unidade={ou.unidade}
							concorrentes={concorrentes}
							onChangePrecoVenda={onChangePrecoVenda}
							valoresConcorrentes={valoresConcorrentes}
							openOfertaProduto={openOfertaProduto} />
					</TableRow>
				))
			) : null}
		</React.Fragment>
	);
}

export default RowProduto;