import React from 'react';
import classnames from 'classnames';
import { TableCell } from '@material-ui/core';

import { customNumberFormat, DECIMAIS } from '../../../../utils/formats';
import CustomTextField from './CustomTextField';

const numberFormat = valor => customNumberFormat(valor, { minDecimals: 2, maxDecimals: 2 })

const CellsProduto = ({
	classes,
	produto: p,
	concorrentes,
	onChangePrecoVenda,
	valoresConcorrentes = {},
	openOfertaProduto,
}) => {
	return (
		<React.Fragment>
			<TableCell>{p.codigo}</TableCell>
			<TableCell>{p.codigo_barra}</TableCell>
			<TableCell>{p.descricao}</TableCell>
			{/* <TableCell>ABC</TableCell>
		<TableCell>Samsung</TableCell>
		<TableCell>X</TableCell>
		<TableCell>Y</TableCell> */}
			<TableCell align="right">R$ {numberFormat(p.preco_compra, DECIMAIS.VALOR)}</TableCell>
			<TableCell align="right">R$ {numberFormat(p.custo_total, DECIMAIS.VALOR)}</TableCell>
			<TableCell >
				<CustomTextField
					showOfertaIcon
					value={p.preco_venda}
					isOferta={true}
					handleProdutoOferta={() => openOfertaProduto(p)}
					onChange={value => onChangePrecoVenda(p, value)} />
			</TableCell>
			<TableCell align="right">{numberFormat(p.margem_atual, DECIMAIS.PERCENTUAL)}%</TableCell>
			<TableCell align="right">{numberFormat(p.margem, DECIMAIS.PERCENTUAL)}%</TableCell>
			<TableCell align="right">R$ {numberFormat(p.preco_sugerido, DECIMAIS.VALOR)}</TableCell>

			{concorrentes.map((c, indexConcorrente) => {
				const v = valoresConcorrentes[`${c.uuid}_${p.uuid}`];
				return (
					<React.Fragment key={indexConcorrente}>
						<TableCell align="right" className={classnames(['concorrente', classes.columnConcorrente])}>
							{v && v.preco_venda ? `R$ ${numberFormat(v.preco_venda, DECIMAIS.VALOR)}` : '-'}
						</TableCell>
						<TableCell align="right" className={classnames(['concorrente', classes.columnConcorrente])}>
							{v && v.margem_venda ? `${numberFormat(v.margem_venda, DECIMAIS.PERCENTUAL)}%` : '-'}
						</TableCell>
					</React.Fragment>
				);
			})}
		</React.Fragment>
	);
}

export default CellsProduto;