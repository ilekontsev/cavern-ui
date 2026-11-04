/**
 * Сегменты маршрутов приложения.
 * Используются в конфигурации Angular Router — пути не должны начинаться со слэша.
 */
export const ROUTE_SEGMENTS = {
	root: '',
	profile: 'profile',
	docs: 'docs',
	sandbox: 'sandbox',
	login: 'login',
	register: 'register',
	wildcard: '**',
} as const;

/** Сегменты вложенных маршрутов документации. */
export const DOCS_ROUTE_SEGMENTS = {
	button: 'button',
	input: 'input',
	icon: 'icon',
	loader: 'loader',
} as const;

/**
 * Абсолютные URL для routerLink и навигации.
 * Собираются из сегментов, чтобы путь менялся в одном месте.
 */
export const ROUTE_URLS = {
	home: '/',
	profile: `/${ROUTE_SEGMENTS.profile}`,
	docs: `/${ROUTE_SEGMENTS.docs}`,
	sandbox: `/${ROUTE_SEGMENTS.sandbox}`,
	login: `/${ROUTE_SEGMENTS.login}`,
	register: `/${ROUTE_SEGMENTS.register}`,
	docsButton: `/${ROUTE_SEGMENTS.docs}/${DOCS_ROUTE_SEGMENTS.button}`,
	docsInput: `/${ROUTE_SEGMENTS.docs}/${DOCS_ROUTE_SEGMENTS.input}`,
	docsIcon: `/${ROUTE_SEGMENTS.docs}/${DOCS_ROUTE_SEGMENTS.icon}`,
	docsLoader: `/${ROUTE_SEGMENTS.docs}/${DOCS_ROUTE_SEGMENTS.loader}`,
} as const;
