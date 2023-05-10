import React from 'react';

const Form = ({ onSubmit, ...props }) => {
	const handleSubmit = ev => {
		ev.preventDefault();
		onSubmit(ev);
	};
	return <form noValidate onSubmit={handleSubmit} {...props} />;
}

export default Form;