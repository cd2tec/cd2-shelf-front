import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles, Grid, Typography, Box, colors } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

import { DECIMAIS, numberFormat } from '../../../utils/formats';
import CardGrafico from './CardGrafico';

const useStyles = makeStyles((theme) => ({
	widget: {
		height: '100%',
	},
	differenceDownIcon: {
		color: colors.red[900]
	},
	differenceDownValue: {
		color: colors.red[900],
		marginRight: theme.spacing(1)
	},
	differenceUpIcon: {
		color: colors.green[900]
	},
	differenceUpValue: {
		color: colors.green[900],
		marginRight: theme.spacing(1)
	}
}));

const SingleStat = ({ tipo, promise, promiseParams, ...props }) => {
	const classes = useStyles();
	const [valor, setValor] = useState(null);
	const [diferencial, setDiferencial] = useState(null);
	const [loading, setLoading] = useState(true);
	const [lastPromiseParamsCheck, setLastPromiseParamsCheck] = useState();

	useEffect(() => {
		const promiseParamsCheck = JSON.stringify(promiseParams);
		if (promiseParamsCheck === lastPromiseParamsCheck) {
			return;
		}
		setLastPromiseParamsCheck(promiseParamsCheck);

		setLoading(true);
		promise(promiseParams)
			.then(rs => {
				if (rs.value) {
					setValor(rs.value);
					setDiferencial(rs.diferencial);
					return;
				}
				if (rs.data && rs.data.value) {
					setValor(rs.data.value);
					setDiferencial(rs.data.diferencial);
					return;
				}
			})
			.finally(() => setLoading(false));
	}, [promise, promiseParams, lastPromiseParamsCheck]);

	return (
		<CardGrafico {...props} loading={loading}>
			<Grid container direction="column">
				<Grid item>
					<Typography color="textSecondary" gutterBottom variant="h6">
						{loading ? 'Carregando...' : `R$ ${numberFormat(valor, DECIMAIS.VALOR)}`}
					</Typography>
				</Grid>

				{diferencial > 0 || diferencial < 0 ? (
					<Grid item>
						<Box mt={2} display="flex" alignItems="center">
							{diferencial > 0
								? <ArrowUpwardIcon className={classes.differenceUpIcon} />
								: <ArrowDownwardIcon className={classes.differenceDownIcon} />}

							<Typography
								variant="body2"
								className={diferencial > 0 ? classes.differenceUpValue : classes.differenceDownValue}>
								{numberFormat(diferencial, DECIMAIS.PERCENTUAL)}%
							</Typography>

							<Typography color="textSecondary" variant="caption">
								Meta
							</Typography>
						</Box>
					</Grid>
				) : null}
			</Grid>
		</CardGrafico>
	);
}

SingleStat.propTypes = {
	promise: PropTypes.func.isRequired,
}

export default SingleStat;