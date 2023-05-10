import React from 'react';
import { whenForbidden, whenUnauthorized, whenBadRequest, whenInternalServerError } from './http/filters';
import alerts from '../../utils/alerts';

export class Errors {
	details = [];

	constructor(details) {
		this.details = details || [];
	}

	addFieldViolation(field, description) {
		this.details.push({ field, description });
		return this;
	}

	addRequiredField(field) {
		this.details.push({ field, description: 'Campo obrigatório.' });
		return this;
	}

	clearField(field) {
		this.details = this.details.filter(d => d.field !== field);
		return this;
	}

	fromField(field) {
		return this.details.filter(d => d.field === field);
	}

	hasErrors() {
		return this.details.length > 0;
	}
}

export function filterErrors(errs, filters) {
	if (!errs || !errs.details) {
		return null;
	}
	const filtered = errs.details.filter((filters instanceof Array)
		? err => filters.indexOf(err.field) >= 0
		: err => err.field === filters);
	if (filtered.length === 0) {
		return null;
	}
	let rs = [];
	for (const e of filtered) {
		rs.push(
			<React.Fragment key={rs.length}>
				{rs.length > 0 ? <br /> : null}
				{e.description}
			</React.Fragment>
		);
	}
	return rs;
}

export function processCatch(processors, notifyUnauthorizedAccess) {
	if (typeof processors === 'function') {
		processors = [processors];
	} else {
		if (!processors) {
			processors = [];
		}
	}
	if (notifyUnauthorizedAccess !== false) {
		processors.push(whenForbidden(notifyUnauthorized()));
		processors.push(whenUnauthorized(notifyUnauthorized()));
	}

	return rs => {
		for (let p of processors) {
			p(rs);
		}
	};
}

export function processBadRequest(cb, forceCallback) {
	return whenBadRequest(rs => {
		if (!rs) {
			return;
		}

		if (rs.error && !rs.details) {
			alerts.warning('Erro ao processar requisição.', rs.error);
			console.warn('Erro ao processar requisição.', rs.error);
		}
		if ((rs.details || forceCallback === true) && cb) {
			cb(new Errors(rs.details));
		}
	});
}

export function defaultProcessCatch(cbBadRequest, processors, forceCallback) {
	if (typeof processors === 'function') {
		processors = [processors];
	} else {
		if (!processors || !(processors instanceof Array)) {
			processors = [];
		}
	}

	processors.push(processBadRequest(cbBadRequest, forceCallback));
	processors.push(whenInternalServerError(notifyInternalServerError()));
	return rs => processCatch(processors)(rs);
}

export function notifyUnauthorized(onClose) {
	return rs => {
		alerts.error('Acesso Negado', 'Você não possui permissão para essa ação.', { onClose });
		console.error('Acesso Negado', 'Você não possui permissão para essa ação.');
	};
}

export function notifyInternalServerError(onClose) {
	return rs => {
		console.error('Erro interno', 'Ocorreu um erro ao processar a requisição. Por favor, tente novamente mais tarde.');
	}
}