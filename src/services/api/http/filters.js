export function whenSuccess(cb) {
	return rs => {
		if (rs.status >= 200 && rs.status <= 299) {
			cb(rs);
		}
		return rs;
	};
}

export function whenNotSuccess(cb) {
	return rs => {
		if (rs.status < 200 || rs.status >= 300) {
			cb(rs);
		}
		return rs;
	};
}

export function whenBadRequest(cb) {
	return rs => {
		if (rs.status === 400 || rs.status === 412) {
			rs.json().then(rsJSON => cb(rsJSON));
		}
		return rs;
	};
}

export function whenUnauthorized(cb) {
	return rs => {
		if (rs.status === 401) {
			rs.json().then(rsJSON => cb(rsJSON));
		}
		return rs;
	};
}

export function whenForbidden(cb) {
	return rs => {
		if (rs.status === 403) {
			rs.json().then(rsJSON => cb(rsJSON));
		}
		return rs;
	};
}

export function whenNotFound(cb) {
	return rs => {
		if (rs.status === 404) {
			cb(rs);
		}
		return rs;
	};
}

export function whenInternalServerError(cb) {
	return rs => {
		if (rs.status === 500) {
			cb(rs);
		}
		return rs;
	};
}

export function whenAlreadyExists(cb) {
	return rs => {
		if (rs.status === 409) {
			cb(rs);
		}
		return rs;
	};
}