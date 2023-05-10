import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

function NormalMessage({ title, content, onRequestClose, DialogProps = { maxWidth: 'md', fullWidth: true } }) {
	return (
		<Dialog open={true} {...DialogProps}>
			{title ? <DialogTitle>{title}</DialogTitle> : null}
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button onClick={() => onRequestClose()}>OK</Button>
			</DialogActions>
		</Dialog>
	);
}

export default NormalMessage;
