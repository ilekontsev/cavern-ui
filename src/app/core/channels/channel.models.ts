/** Канал в том виде, в котором его отдаёт mock API. */
export interface Channel {
	id: string;
	name: string;
	description: string;
	ownerId: string;
	ownerLogin: string;
	createdAt: string;
	membersCount: number;
	/** Текущий пользователь — владелец канала. */
	isOwner: boolean;
	/** Текущий пользователь уже состоит в канале (владелец тоже считается участником). */
	isMember: boolean;
}

/** Участник канала в том виде, в котором его отдаёт mock API. */
export interface ChannelMember {
	id: string;
	login: string;
	/** Этот участник — владелец канала. */
	isOwner: boolean;
}

export interface ChannelCreatePayload {
	name: string;
	description: string;
}

export interface ChannelListResponse {
	channels: Channel[];
}

export interface ChannelResponse {
	channel: Channel;
}

export interface ChannelMembersResponse {
	members: ChannelMember[];
}
