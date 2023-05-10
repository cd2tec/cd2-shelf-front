import areIntlLocalesSupported from 'intl-locales-supported';

let NumberFormat;
if (areIntlLocalesSupported(['pt-BR'])) {
	NumberFormat = global.Intl.NumberFormat;
} else {
	NumberFormat = global.IntlPolyfill.NumberFormat;
}

export function customNumberFormat(value, options) {
	if (options) {
		const { minDecimals = 0, maxDecimals = 0 } = options;
		return NumberFormat('pt-BR', {
			minimumIntegerDigits: 1,
			maximumFractionDigits: maxDecimals,
			minimumFractionDigits: minDecimals,
		}).format(value);
	}
	return NumberFormat('pt-BR').format(value);
}

export function numberFormat(value, decimals) {
	value = value || 0;
	if (typeof (decimals) === 'object') {
		return customNumberFormat(value, decimals);
	}
	if (typeof (decimals) === 'function') {
		return customNumberFormat(value, decimals(value));
	}

	decimals = decimals === undefined ? 2 : decimals;
	return customNumberFormat(value, { minDecimals: decimals, maxDecimals: decimals });
}

export const DECIMAIS = {
	QUANTIDADES: { minDecimals: 3, maxDecimals: 3 },
	VALOR: { minDecimals: 2, maxDecimals: 2 },
	VALOR_COMPRA: { minDecimals: 3, maxDecimals: 3 },
	MARGEM_LUCRO: { minDecimals: 3, maxDecimals: 3 },
	PERCENTUAL: { minDecimals: 0, maxDecimals: 3 },
}