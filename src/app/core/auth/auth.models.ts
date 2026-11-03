export type UserRole = 'user' | 'admin';
export type UserType = 'standard' | 'premium';

/** Значения, которые система назначает при регистрации. */
export const DEFAULT_USER_ROLE: UserRole = 'user';
export const DEFAULT_USER_TYPE: UserType = 'standard';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
	user: 'Пользователь',
	admin: 'Администратор',
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
	standard: 'Стандартный',
	premium: 'Премиум',
};

/** Запись пользователя в mock-базе json-server. Пароль хранится только здесь. */
export interface UserRecord {
	id: string;
	login: string;
	password: string;
	role: UserRole;
	type: UserType;
	registeredAt: string;
}

/** Пользователь без пароля — именно он попадает в состояние приложения и localStorage. */
export type User = Omit<UserRecord, 'password'>;

export interface LoginPayload {
	login: string;
	password: string;
}

export interface RegisterPayload {
	login: string;
	password: string;
}

export type AuthErrorCode = 'loginTaken' | 'invalidCredentials';

export class AuthError extends Error {
	constructor(readonly code: AuthErrorCode) {
		super(code);
		this.name = 'AuthError';
	}
}
