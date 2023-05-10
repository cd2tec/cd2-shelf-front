const emailRE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function isValidEmail(email) {
	if (!email || !email.length) {
		return false;
	}
  	return emailRE.test(email);
}

export function userCan(permissoes, permissao) {
  return permissoes.map(p => p.permissao).includes(permissao)
}
