import React from 'react';
import PropTypes from 'prop-types';

import { Button, Snackbar, Slide } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

function SlideTransition(props) {
	return <Slide {...props} direction="up" />;
}

export const SimpleSnackbar = ({ title, message, variant, onClose, onRequestClose = () => { } }) => {
	const close = () => onRequestClose(onClose);

	const handleSnackbarClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		close();
	}

	return (
		<Snackbar
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			open={true} autoHideDuration={5000}
			TransitionComponent={SlideTransition}
			onClose={handleSnackbarClose}>
			<Alert
				severity={variant}
				variant="filled"
				action={
					<Button size="small" color="inherit" onClick={() => close()}>
						OK
					</Button>
				}>
				{title ? <AlertTitle>{title}</AlertTitle> : null}
				{message}
			</Alert >
		</Snackbar >
	);
}

SimpleSnackbar.propTypes = {
	title: PropTypes.node,
	message: PropTypes.node.isRequired,
	variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,

	onClose: PropTypes.func,
	onRequestClose: PropTypes.func,
};
