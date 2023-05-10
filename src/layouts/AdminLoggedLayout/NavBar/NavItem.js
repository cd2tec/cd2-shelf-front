import React, { forwardRef, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
	Collapse,
	List,
	ListItem,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

const itemSpace = 40;

const useStyles = makeStyles((theme) => ({
	item: {
		paddingTop: 0,
		paddingBottom: 0,
		'&.active': {
			marginLeft: -itemSpace,
			paddingLeft: itemSpace,
			width: `calc(100% + ${itemSpace}px)`,
			backgroundColor: '#f4f6f8',
			'& *': {
				color: theme.palette.primary.main,
			},
			borderRadius: '0 8px 8px 0',
		},
	},
	itemText: {
		color: theme.palette.text.secondary,
		fontWeight: theme.typography.fontWeightMedium,
		textTransform: 'none',
	},
	itemTextActive: {
		'& > span': {
			fontWeight: 700,
		},
	},
	itemTextInset: {
		marginLeft: 12,
	},
	itemIcon: {
		marginRight: theme.spacing(1)
	},
	itemSecondaryAction: {
		cursor: 'pointer',
	},
}));

const NavItem = ({
	className,
	href,
	icon: Icon,
	title,
	insetTitle,
	items = [],
	...rest
}) => {
	const classes = useStyles();
	const [open, setOpen] = useState(false);

	const CustomLink = useMemo(() => {
		return href
			? forwardRef((linkProps, ref) => <NavLink ref={ref} to={href} {...linkProps} />)
			: undefined;
	}, [href]);

	const handleClick = items.length
		? () => setOpen(!open)
		: undefined;

	return (
		<React.Fragment>
			<ListItem
				button
				component={CustomLink}
				onClick={handleClick}
				className={clsx(classes.item, className)}
				disableGutters
				{...rest}>
				{Icon && (
					<ListItemIcon>
						<Icon className={classes.itemIcon} size="20" />
					</ListItemIcon>
				)}

				<ListItemText
					className={clsx(classes.itemText, {
						[classes.itemTextActive]: items.length && open,
						[classes.itemTextInset]: insetTitle,
					})}
					primary={title}
					inset={!Icon} />

				{items.length > 0 && (
					<ListItemSecondaryAction onClick={handleClick} className={classes.itemSecondaryAction}>
						{open ? <ExpandLess /> : <ExpandMore />}
					</ListItemSecondaryAction>
				)}
			</ListItem>

			{items.length ? (
				<Collapse in={open} unmountOnExit>
					<List disablePadding>
						{items.filter(item => !!item).map((item, index) => (
							<NavItem
								key={index}
								href={item.href}
								title={item.title}
								icon={item.icon}
								insetTitle
							/>
						))}
					</List>
				</Collapse>
			) : null}
		</React.Fragment>
	);
};

NavItem.propTypes = {
	className: PropTypes.string,
	href: PropTypes.string,
	icon: PropTypes.elementType,
	title: PropTypes.string
};

export default NavItem;
