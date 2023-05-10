import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import withMobileDialog from '@material-ui/core/withMobileDialog';
import { withStyles } from '@material-ui/core';

import { bootstrapBackgroundColors } from '../../theme';

function CustomDialog(props) {
	const { variant, ...others } = props;
	if (variant === 'default') {
		return <Dialog {...others} />;
	}
	const InternalDialog = withStyles({ paper: { backgroundColor: bootstrapBackgroundColors[variant] } })(Dialog);
	return <InternalDialog {...others} />;
}

class InternalYesNoConfirmMessage extends React.Component {
	static propTypes = {
		fullScreen: PropTypes.bool.isRequired,

		title: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
		]).isRequired,
		message: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
		]),
		showCancel: PropTypes.bool,
		onYes: PropTypes.func,
		onNo: PropTypes.func,
		onResponse: PropTypes.func,
		type: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'danger']).isRequired,

		onRequestClose: PropTypes.func.isRequired,
	}

	static defaultProps = {
		onRequestClose: () => { },
		type: 'default',
	}

	handleResponse = response => {
		let fn = response ? this.props.onYes : this.props.onNo;
		if (!fn && this.props.onResponse) {
			fn = () => this.props.onResponse(response);
		}
		return fn;
	}

	handleCancel = () => this.props.onRequestClose()
	handleNo = () => this.props.onRequestClose(this.handleResponse(false))
	handleYes = () => this.props.onRequestClose(this.handleResponse(true))

	render() {
		const { fullScreen, title, message, type, showCancel } = this.props;

		return (
			<CustomDialog fullScreen={fullScreen} open={true} variant={type}
				disableBackdropClick={true} disableEscapeKeyDown={true}>
				<DialogTitle>{title}</DialogTitle>
				<DialogContent>
					<DialogContentText style={{ whiteSpace: 'pre-wrap' }}>{message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					{showCancel
						? <Button onClick={this.handleCancel}>Cancelar</Button>
						: null}
					<Button onClick={this.handleNo}>Não</Button>
					<Button onClick={this.handleYes}>Sim</Button>
				</DialogActions>
			</CustomDialog>
		);
	}
}

export const YesNoConfirmMessage = withMobileDialog()(InternalYesNoConfirmMessage);
