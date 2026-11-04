import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../api';
import {
	Channel,
	ChannelCreatePayload,
	ChannelListResponse,
	ChannelMember,
	ChannelMembersResponse,
	ChannelResponse,
} from './channel.models';

const CHANNELS_URL = `${API_BASE_URL}/channels`;

/** Каналы: поиск, список своих каналов, создание, вступление и удаление. */
@Injectable({ providedIn: 'root' })
export class ChannelService {
	private readonly http = inject(HttpClient);

	/** Все каналы или результат поиска по названию и описанию. */
	public list(search = ''): Observable<Channel[]> {
		const query = search.trim();
		const params = query ? new HttpParams().set('search', query) : undefined;

		return this.http
			.get<ChannelListResponse>(CHANNELS_URL, { params, withCredentials: true })
			.pipe(map(({ channels }) => channels));
	}

	/** Каналы, которыми пользователь владеет или в которых состоит. */
	public mine(): Observable<Channel[]> {
		const params = new HttpParams().set('mine', 'true');

		return this.http
			.get<ChannelListResponse>(CHANNELS_URL, { params, withCredentials: true })
			.pipe(map(({ channels }) => channels));
	}

	public get(id: string): Observable<Channel> {
		return this.http
			.get<ChannelResponse>(`${CHANNELS_URL}/${encodeURIComponent(id)}`, {
				withCredentials: true,
			})
			.pipe(map(({ channel }) => channel));
	}

	/** Участники канала. */
	public members(id: string): Observable<ChannelMember[]> {
		return this.http
			.get<ChannelMembersResponse>(`${CHANNELS_URL}/${encodeURIComponent(id)}/members`, {
				withCredentials: true,
			})
			.pipe(map(({ members }) => members));
	}

	/** Удалить участника из канала. Доступно только владельцу. */
	public removeMember(id: string, memberId: string): Observable<ChannelMember[]> {
		return this.http
			.delete<ChannelMembersResponse>(
				`${CHANNELS_URL}/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
				{
					withCredentials: true,
				}
			)
			.pipe(map(({ members }) => members));
	}

	public create(payload: ChannelCreatePayload): Observable<Channel> {
		return this.http
			.post<ChannelResponse>(CHANNELS_URL, payload, { withCredentials: true })
			.pipe(map(({ channel }) => channel));
	}

	public join(id: string): Observable<Channel> {
		return this.http
			.post<ChannelResponse>(
				`${CHANNELS_URL}/${encodeURIComponent(id)}/join`,
				{},
				{
					withCredentials: true,
				}
			)
			.pipe(map(({ channel }) => channel));
	}

	public remove(id: string): Observable<void> {
		return this.http.delete<void>(`${CHANNELS_URL}/${encodeURIComponent(id)}`, {
			withCredentials: true,
		});
	}
}
