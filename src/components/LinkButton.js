import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';

export default function LinkButton(props) {
	return <Button component={Link} {...props} />;
}