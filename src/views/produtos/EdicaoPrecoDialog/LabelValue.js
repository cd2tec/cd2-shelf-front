import React from 'react';

import { Grid, Typography } from '@material-ui/core';

const LabelValue = ({ label, direction = 'column', children, labelAlign = 'left', xsLabel, xsValue }) => (
	<Grid container direction={direction}>
		<Grid item xs={xsLabel}>
			<Typography component="span" variant="subtitle2" color="primary" align={labelAlign}>
				{label}:
			</Typography>
		</Grid>

		<Grid item xs={xsValue}>
			{children}
		</Grid>
	</Grid>
)

export default LabelValue;