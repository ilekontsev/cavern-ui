import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../api';
import {
	Channel,
	ChannelCreatePayload,
	ChannelListResponse,
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
