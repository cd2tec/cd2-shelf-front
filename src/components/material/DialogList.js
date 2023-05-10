import React from 'react';

import {
	Dialog, DialogTitle, DialogActions,
	Button, List, ListItem, ListItemText,
} from '@material-ui/core';

const DialogList = ({
	title,
	itens = [],
	renderItemTitle = () => { },
	renderItemSubtitle = () => null,
	onClick,
	onClose,
}) => {
	return (
		<Dialog open={true} maxWidth="sm" fullWidth>
			<DialogTitle>{title}</DialogTitle>

			<List>
				{itens.map((i, index) => (
					<ListItem key={index} button onClick={() => onClick(i, index)}>
						<ListItemText
							primary={renderItemTitle(i, index)}
							secondary={renderItemSubtitle(i, index)} />
					</ListItem>
				))}
			</List>

			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DialogList;