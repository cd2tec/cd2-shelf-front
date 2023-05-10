import React, { useState } from 'react';

import {
	Card, CardHeader, Tooltip, CardContent,
	IconButton, LinearProgress, colors, withStyles, makeStyles,
} from '@material-ui/core';
import { ContactSupport } from '@material-ui/icons';

const HtmlTooltip = withStyles(theme => ({
	tooltip: {
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(12),
		border: '1px solid #dadde9',
	},
}))(Tooltip);

const useStyles = makeStyles(theme => ({
	clickableCard: {
		'&:hover': {
			backgroundColor: colors.grey[200],
			cursor: 'pointer',
			transform: 'scale(1.02)',
		},
		transition: 'all 0.2s',
	},
	cardHeader: {
		backgroundColor: '#004a77',
		color: 'white',
		padding: '4px 16px',
		'& span': {
			fontSize: '1.3rem',
			fontWeight: 500,
		},
	},
}));

const CardGrafico = ({ title, helpText, children, loading, onClick }) => {
	const classes = useStyles();
	const [dialog, setDialog] = useState(null);

	return (
		<React.Fragment>
			<Card
				onClick={onClick ? () => onClick({ setDialog }) : undefined}
				className={onClick ? classes.clickableCard : undefined}>
				<CardHeader
					title={title}
					className={classes.cardHeader}
					action={
						helpText ? (
							<IconButton>
								<HtmlTooltip title={helpText}>
									<ContactSupport style={{ color: colors.blue[200], cursor: 'help' }} />
								</HtmlTooltip>
							</IconButton>
						) : null
					} />

				{loading ? <LinearProgress /> : null}
				<CardContent>{children}</CardContent>
			</Card>

			{dialog}
		</React.Fragment>
	);
}

export default CardGrafico;