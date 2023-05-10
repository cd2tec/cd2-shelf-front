import React from 'react';
import PropTypes from 'prop-types';

import {
	Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
	Button, withStyles,
} from '@material-ui/core';

import { bootstrapBackgroundColors } from '../../theme';

class OKMessage extends React.Component {
	boxColor = '#FFFFFF';

	static propTypes = {
		title: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
		]).isRequired,
		message: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
		]),
		onClose: PropTypes.func,

		onRequestClose: PropTypes.func.isRequired,
	}

	static defaultProps = {
		onRequestClose: () => { },
	}

	handleClose = () => this.props.onRequestClose(this.props.onClose)

	render() {
		const { title, message } = this.props;
		const paperStyle = { backgroundColor: this.boxColor };

		const InternalDialog = withStyles({ paper: paperStyle })(Dialog);
		return (
			<InternalDialog open={true}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<DialogContentText style={{ whiteSpace: 'pre-wrap' }}>{message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleClose}>OK</Button>
				</DialogActions>
			</InternalDialog>
		);
	}
}

export class OKInfoMessage extends OKMessage {
	boxColor = bootstrapBackgroundColors.info;
}

export class OKSuccessMessage extends OKMessage {
	boxColor = bootstrapBackgroundColors.success;
}

export class OKWarningMessage extends OKMessage {
	boxColor = bootstrapBackgroundColors.warning;
}

export class OKErrorMessage extends OKMessage {
	boxColor = bootstrapBackgroundColors.danger;
}
