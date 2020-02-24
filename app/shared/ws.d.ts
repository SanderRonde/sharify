export interface ErrorMessage<T> {
	type: T;
	success: false;
	error: string;
}

export type FailableMessage<T, B> = (ErrorMessage<T> & Partial<B>) | ({
	type: T;
	success: true;
} & B);

export type WebsocketMessages = FailableMessage<'join', {
	members: {
		name: string;
		email: string;
		isHost: boolean;
	}[];
}> | FailableMessage<'playlistupdate', {
	// TODO:
}> | ErrorMessage<'connect'>;