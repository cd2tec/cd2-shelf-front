import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, CircularProgress, Grid } from '@material-ui/core';

import alerts from './alerts';

function validatePromises(promises) {
	if (promises instanceof Promise) {
		promises = [promises];
	}
	for (let index in promises) {
		const p = promises[index];
		if (!(p instanceof Promise)) {
			throw new Error(`Index ${index} must be a Promise instance.`);
		}
	}
	return promises;
}

function DialogLoading({ title, info, promises, onRequestClose }) {
	useEffect(() => {
		Promise.all(promises).finally(() => onRequestClose());
	}, [promises, onRequestClose]);

	return (
		<Dialog open={true} fullWidth={true} maxWidth="xs">
			<DialogTitle>
				{title || 'Por favor, aguarde...'}
			</DialogTitle>

			<DialogContent style={{ minHeight: 64 }}>
				<Grid container={true} spacing={2} alignItems="center">
					<Grid item xs={2} style={{ textAlign: 'center' }}>
						<CircularProgress />
					</Grid>

					<Grid item xs={10} style={{ paddingLeft: 8 }}>
						{info}
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
}

export function showLoading(info, promises) {
	showLoadingCustom(null, info, promises);
}

export function showLoadingCustom(title, info, promises) {
	alerts.show(
		<DialogLoading
			title={title}
			info={info}
			promises={validatePromises(promises)} />
	);
}

export default showLoading;