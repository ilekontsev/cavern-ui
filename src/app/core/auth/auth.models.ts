export type UserRole = 'guest' | 'user' | 'admin';
export type UserType = 'standard' | 'premium';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
	guest: 'Гость',
	user: 'Пользователь',
	admin: 'Администратор',
};

export const USER_TYPE_LABELS: Record<UserType, string> = {
	standard: 'Стандартный',
	premium: 'Премиум',
};

/** Запись пользователя в db.json mock-сервера. Пароль хранится только здесь. */
export interface UserRecord {
	id: string;
	login: string;
	password: string;
	role: UserRole;
	type: UserType;
	registeredAt: string;
}

/** Пользователь без пароля — именно он попадает в состояние приложения. */
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
	constructor(public readonly code: AuthErrorCode) {
		super(code);
		this.name = 'AuthError';
	}
}
