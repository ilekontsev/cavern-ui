'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = path.join(__dirname, '..', 'db.json');
const AUTH_SECRET = process.env.AUTH_SECRET || 'cavern-local-dev-secret';
const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL || 15 * 60);
const REFRESH_TTL = Number(process.env.REFRESH_TOKEN_TTL || 7 * 24 * 60 * 60);

const ACCESS_COOKIE = 'cavern_access_token';
const REFRESH_COOKIE = 'cavern_refresh_token';

const TOKEN_HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
	'base64url'
);

function readDb() {
	return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
	fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
}

function sign(value) {
	return crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
}

function issueToken(user, tokenType, ttl) {
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		sub: user.id,
		login: user.login,
		role: user.role,
		type: user.type,
		registeredAt: user.registeredAt,
		tokenType,
		iat: now,
		exp: now + ttl,
	};
	const body = Buffer.from(JSON.stringify(payload)).toString('base64url');

	return `${TOKEN_HEADER}.${body}.${sign(`${TOKEN_HEADER}.${body}`)}`;
}

function verifyToken(token, expectedType) {
	if (!token) {
		return null;
	}

	const parts = token.split('.');

	if (parts.length !== 3) {
		return null;
	}

	const [header, body, signature] = parts;
	const expectedSignature = sign(`${header}.${body}`);
	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);

	if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
		return null;
	}

	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
		const now = Math.floor(Date.now() / 1000);

		if (payload.tokenType !== expectedType || typeof payload.exp !== 'number') {
			return null;
		}

		if (payload.exp <= now) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}

function toPublicUser(record) {
	return {
		id: record.id,
		login: record.login,
		role: record.role,
		type: record.type,
		registeredAt: record.registeredAt,
	};
}

/** Для гостя данных в db.json нет — пользователь восстанавливается из токена. */
function resolveUser(payload) {
	if (!payload || typeof payload.sub !== 'string') {
		return null;
	}

	if (payload.role === 'guest') {
		return {
			id: payload.sub,
			login: payload.login,
			role: payload.role,
			type: payload.type,
			registeredAt: payload.registeredAt,
		};
	}

	const record = readDb().users.find((user) => user.id === payload.sub);

	return record ? toPublicUser(record) : null;
}

function createGuest() {
	const now = new Date().toISOString();

	return {
		id: crypto.randomUUID(),
		login: 'guest',
		role: 'guest',
		type: 'standard',
		registeredAt: now,
	};
}

/** Текущий пользователь по access-cookie. Нет валидного токена — null. */
function getAuthUser(request) {
	const cookies = parseCookies(request);

	return resolveUser(verifyToken(cookies[ACCESS_COOKIE], 'access'));
}

function readChannels(db) {
	return Array.isArray(db.channels) ? db.channels : [];
}

function toPublicChannel(record, user) {
	const members = Array.isArray(record.members) ? record.members : [];

	return {
		id: record.id,
		name: record.name,
		description: record.description,
		ownerId: record.ownerId,
		ownerLogin: record.ownerLogin,
		createdAt: record.createdAt,
		membersCount: members.length,
		isOwner: Boolean(user) && record.ownerId === user.id,
		isMember: Boolean(user) && members.includes(user.id),
	};
}

function parseCookies(request) {
	const header = request.headers.cookie;

	if (!header) {
		return {};
	}

	return header.split(';').reduce((cookies, pair) => {
		const index = pair.indexOf('=');

		if (index === -1) {
			return cookies;
		}

		const name = pair.slice(0, index).trim();
		const value = pair.slice(index + 1).trim();

		if (name) {
			cookies[name] = decodeURIComponent(value);
		}

		return cookies;
	}, {});
}

function cookieOptions(maxAge) {
	const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

	return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function setAuthCookies(response, user) {
	response.setHeader('Set-Cookie', [
		`${ACCESS_COOKIE}=${issueToken(user, 'access', ACCESS_TTL)}; ${cookieOptions(ACCESS_TTL)}`,
		`${REFRESH_COOKIE}=${issueToken(user, 'refresh', REFRESH_TTL)}; ${cookieOptions(REFRESH_TTL)}`,
	]);
}

function clearAuthCookies(response) {
	response.setHeader('Set-Cookie', [
		`${ACCESS_COOKIE}=; ${cookieOptions(0)}`,
		`${REFRESH_COOKIE}=; ${cookieOptions(0)}`,
	]);
}

function sendJson(response, status, body, extraHeaders = {}) {
	const payload = JSON.stringify(body);

	response.writeHead(status, {
		'Content-Type': 'application/json; charset=utf-8',
		'Content-Length': Buffer.byteLength(payload),
		'Cache-Control': 'no-store',
		...extraHeaders,
	});
	response.end(payload);
}

function readJson(request) {
	return new Promise((resolve, reject) => {
		let body = '';

		request.on('data', (chunk) => {
			body += chunk;

			if (body.length > 1_000_000) {
				reject(new Error('payloadTooLarge'));
				request.destroy();
			}
		});
		request.on('end', () => {
			if (!body) {
				resolve({});
				return;
			}

			try {
				resolve(JSON.parse(body));
			} catch (error) {
				reject(error);
			}
		});
		request.on('error', reject);
	});
}

function sendAuthResponse(response, user, status = 200) {
	setAuthCookies(response, user);
	sendJson(response, status, { user });
}

async function handleLogin(request, response) {
	const body = await readJson(request);
	const login = typeof body.login === 'string' ? body.login.trim() : '';
	const password = typeof body.password === 'string' ? body.password : '';
	const record = readDb().users.find((user) => user.login === login);

	if (!record || record.password !== password) {
		sendJson(response, 401, { code: 'invalidCredentials' });
		return;
	}

	sendAuthResponse(response, toPublicUser(record));
}

async function handleRegister(request, response) {
	const body = await readJson(request);
	const login = typeof body.login === 'string' ? body.login.trim() : '';
	const password = typeof body.password === 'string' ? body.password : '';

	if (!/^[a-zA-Z0-9_-]{3,32}$/.test(login) || password.length < 8) {
		sendJson(response, 400, { code: 'invalidPayload' });
		return;
	}

	const db = readDb();

	if (db.users.some((user) => user.login === login)) {
		sendJson(response, 409, { code: 'loginTaken' });
		return;
	}

	const record = {
		id: crypto.randomUUID(),
		login,
		password,
		role: 'user',
		type: 'standard',
		registeredAt: new Date().toISOString(),
	};

	db.users.push(record);
	writeDb(db);

	sendAuthResponse(response, toPublicUser(record), 201);
}

function handleCurrentUser(request, response) {
	const cookies = parseCookies(request);
	const accessPayload = verifyToken(cookies[ACCESS_COOKIE], 'access');
	const accessUser = resolveUser(accessPayload);

	if (accessUser) {
		sendJson(response, 200, { user: accessUser });
		return;
	}

	// Access истёк, но refresh ещё жив — интерцептор обновит токен и повторит запрос.
	const refreshPayload = verifyToken(cookies[REFRESH_COOKIE], 'refresh');

	if (resolveUser(refreshPayload)) {
		sendJson(response, 401, { code: 'tokenExpired' });
		return;
	}

	// Сессии нет: создаём гостя с уникальным id и выдаём ему токены.
	sendAuthResponse(response, createGuest());
}

function handleRefresh(request, response) {
	const cookies = parseCookies(request);
	const payload = verifyToken(cookies[REFRESH_COOKIE], 'refresh');
	const user = resolveUser(payload);

	if (!user) {
		clearAuthCookies(response);
		sendJson(response, 401, { code: 'invalidRefreshToken' });
		return;
	}

	sendAuthResponse(response, user);
}

function handleLogout(request, response) {
	clearAuthCookies(response);
	response.writeHead(204, { 'Cache-Control': 'no-store' });
	response.end();
}

function handleListChannels(request, response, url) {
	const user = getAuthUser(request);
	const search = (url.searchParams.get('search') || '').trim().toLowerCase();
	const mine = url.searchParams.get('mine') === 'true';
	let channels = readChannels(readDb());

	if (mine) {
		if (!user) {
			sendJson(response, 401, { code: 'unauthorized' });
			return;
		}

		channels = channels.filter(
			(channel) =>
				channel.ownerId === user.id ||
				(Array.isArray(channel.members) && channel.members.includes(user.id))
		);
	}

	if (search) {
		channels = channels.filter((channel) => {
			const haystack = `${channel.name} ${channel.description || ''}`.toLowerCase();

			return haystack.includes(search);
		});
	}

	sendJson(response, 200, {
		channels: channels.map((channel) => toPublicChannel(channel, user)),
	});
}

async function handleCreateChannel(request, response) {
	const user = getAuthUser(request);

	if (!user) {
		sendJson(response, 401, { code: 'unauthorized' });
		return;
	}

	if (user.role === 'guest') {
		sendJson(response, 403, { code: 'guestNotAllowed' });
		return;
	}

	const body = await readJson(request);
	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const description = typeof body.description === 'string' ? body.description.trim() : '';

	if (name.length < 2 || name.length > 64 || description.length > 500) {
		sendJson(response, 400, { code: 'invalidPayload' });
		return;
	}

	const db = readDb();
	const record = {
		id: crypto.randomUUID(),
		name,
		description,
		ownerId: user.id,
		ownerLogin: user.login,
		members: [user.id],
		createdAt: new Date().toISOString(),
	};

	db.channels = readChannels(db);
	db.channels.push(record);
	writeDb(db);

	sendJson(response, 201, { channel: toPublicChannel(record, user) });
}

function handleGetChannel(request, response, channelId) {
	const user = getAuthUser(request);
	const channel = readChannels(readDb()).find((item) => item.id === channelId);

	if (!channel) {
		sendJson(response, 404, { code: 'channelNotFound' });
		return;
	}

	sendJson(response, 200, { channel: toPublicChannel(channel, user) });
}

function handleJoinChannel(request, response, channelId) {
	const user = getAuthUser(request);

	if (!user) {
		sendJson(response, 401, { code: 'unauthorized' });
		return;
	}

	const db = readDb();
	const channel = readChannels(db).find((item) => item.id === channelId);

	if (!channel) {
		sendJson(response, 404, { code: 'channelNotFound' });
		return;
	}

	channel.members = Array.isArray(channel.members) ? channel.members : [];

	if (!channel.members.includes(user.id)) {
		channel.members.push(user.id);
		writeDb(db);
	}

	sendJson(response, 200, { channel: toPublicChannel(channel, user) });
}

function handleDeleteChannel(request, response, channelId) {
	const user = getAuthUser(request);

	if (!user) {
		sendJson(response, 401, { code: 'unauthorized' });
		return;
	}

	if (user.role === 'guest') {
		sendJson(response, 403, { code: 'guestNotAllowed' });
		return;
	}

	const db = readDb();
	const channels = readChannels(db);
	const index = channels.findIndex((item) => item.id === channelId);

	if (index === -1) {
		sendJson(response, 404, { code: 'channelNotFound' });
		return;
	}

	if (channels[index].ownerId !== user.id) {
		sendJson(response, 403, { code: 'notOwner' });
		return;
	}

	channels.splice(index, 1);
	db.channels = channels;
	writeDb(db);

	response.writeHead(204, { 'Cache-Control': 'no-store' });
	response.end();
}

const server = http.createServer(async (request, response) => {
	const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
	const pathname = url.pathname.replace(/^\/api/, '') || '/';
	const method = request.method || 'GET';

	try {
		if (pathname === '/users/me' && method === 'GET') {
			handleCurrentUser(request, response);
			return;
		}

		if (pathname === '/auth/login' && method === 'POST') {
			await handleLogin(request, response);
			return;
		}

		if (pathname === '/auth/register' && method === 'POST') {
			await handleRegister(request, response);
			return;
		}

		if (pathname === '/auth/refresh' && method === 'POST') {
			handleRefresh(request, response);
			return;
		}

		if (pathname === '/auth/logout' && method === 'POST') {
			handleLogout(request, response);
			return;
		}

		if (pathname === '/channels' && method === 'GET') {
			handleListChannels(request, response, url);
			return;
		}

		if (pathname === '/channels' && method === 'POST') {
			await handleCreateChannel(request, response);
			return;
		}

		const joinMatch = /^\/channels\/([^/]+)\/join$/.exec(pathname);

		if (joinMatch && method === 'POST') {
			handleJoinChannel(request, response, decodeURIComponent(joinMatch[1]));
			return;
		}

		const channelMatch = /^\/channels\/([^/]+)$/.exec(pathname);

		if (channelMatch && method === 'GET') {
			handleGetChannel(request, response, decodeURIComponent(channelMatch[1]));
			return;
		}

		if (channelMatch && method === 'DELETE') {
			handleDeleteChannel(request, response, decodeURIComponent(channelMatch[1]));
			return;
		}

		sendJson(response, 404, { code: 'notFound' });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'unknownError';

		if (!response.headersSent) {
			sendJson(response, 400, { code: 'invalidRequest', message });
		}
	}
});

server.listen(PORT, () => {
	console.log(`Cavern mock API: http://localhost:${PORT}`);
});
