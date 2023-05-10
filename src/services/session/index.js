import cookie from 'js-cookie';
import { setAuthentication as setAuthenticationAPI } from "../api";

const cookieAttributes = { secure: process.env.NODE_ENV !== 'development' };

function reloadTokenAPI() {
	const accessToken = cookie.get('userToken');
	const entidade = cookie.get('userTokenEntity');

	let token;
	if (accessToken) {
		token = `Bearer ${accessToken}`;
		if (entidade) {
			token += ` ${entidade}`;
		}
	}
	setAuthenticationAPI(token);
}

reloadTokenAPI();

export function clearAuthToken() {
	cookie.remove('userToken', cookieAttributes);
	cookie.remove('userTokenEntity', cookieAttributes);
	reloadTokenAPI();
}

export function setAccessToken(accessToken, refreshToken) {
	cookie.set('userToken', accessToken, cookieAttributes);
	reloadTokenAPI();
}

export function setEntidade(entidade) {
	cookie.set('userTokenEntity', entidade, cookieAttributes);
	reloadTokenAPI();
}