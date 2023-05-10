import React, { useState, useEffect } from 'react';

import { OKInfoMessage, OKSuccessMessage, OKWarningMessage, OKErrorMessage } from './OKMessages';
import NormalMessage from './NormalMessage';
import { YesNoConfirmMessage } from './ConfirmMessages';

import { SimpleSnackbar } from './snackbars';

let openDialog = () => { throw new Error('AlertBox not loaded!'); };
let showSnackbar = () => { throw new Error('AlertBox not loaded!'); };

export function loadDefaultAlertBox(alertBox) {
	openDialog = alertBox.open;
	showSnackbar = alertBox.showSnackbar;
}

export function AlertBox({ onMounted }) {
	const [dialog, setDialog] = useState(null);
	const [snackbar, setSnackbar] = useState(null);

	const open = component => {
		setDialog(React.cloneElement(component, {
			onRequestClose: cb => {
				setDialog(null);
				if (cb && typeof (cb) === 'function') cb();
			},
		}));
	};

	const showSnackbar = component => setSnackbar(
		React.cloneElement(component, {
			onRequestClose: cb => {
				setSnackbar(null);
				if (cb && typeof (cb) === 'function') cb();
			},
		})
	);

	useEffect(() => {
		onMounted({ open, showSnackbar });
	}, [onMounted]);

	return (
		<React.Fragment>
			{dialog}
			{snackbar}
		</React.Fragment>
	);
}

const alerts = {
	normal: (title, content, props) => openDialog(<NormalMessage title={title} content={content} {...props} />),
	info: (title, message, props) => openDialog(<OKInfoMessage title={title} message={message} {...props} />),
	success: (title, message, props) => openDialog(<OKSuccessMessage title={title} message={message} {...props} />),
	warning: (title, message, props) => openDialog(<OKWarningMessage title={title} message={message} {...props} />),
	error: (title, message, props) => openDialog(<OKErrorMessage title={title} message={message} {...props} />),
	confirmYesNo: (title, message, props) => openDialog(<YesNoConfirmMessage title={title} message={message} {...props} />),
	show: (component) => openDialog(component),
	snackbars: {
		info: (message, props) => showSnackbar(<SimpleSnackbar message={message} variant="info" {...props} />),
		success: (message, props) => showSnackbar(<SimpleSnackbar message={message} variant="success" {...props} />),
		warning: (message, props) => showSnackbar(<SimpleSnackbar message={message} variant="warning" {...props} />),
		error: (message, props) => showSnackbar(<SimpleSnackbar message={message} variant="error" {...props} />),
	},
}

export default alerts;