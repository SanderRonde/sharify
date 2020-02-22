import { ROOM_ID_LENGTH, ROOM_TIMEOUT } from "./constants";
import { SpotifyTypes } from "../types/spotify";
import { Spotify } from "./spotify";
import { Util } from "./util";

const roomMap: Map<string,Room> = new Map();

export interface UserInfo {
	name: string;
	email: string;
	id: string;
}

export class RoomMember {
	private _api = new Spotify.API.APIInstance({
		accessToken: this._auth.access_token,
		expiresIn: this._auth.expires_in,
		refreshToken: this._auth.refresh_token
	});

	constructor(private _auth: SpotifyTypes.Endpoints.AuthToken) {}

	private _info: null|UserInfo = null;
	private async _getSpotifyInfo(): Promise<UserInfo> {
		this._info = await (async () => {
			const response = await this._api.endpoints.me();
			if (!response) return {
				email: '?',
				id: '?',
				name: '?'
			};
			const { display_name, email, id } = await response.json();
			return {
				name: display_name,
				email, id
			}
		})();
		return this._info;
	}

	getInfo(): Promise<UserInfo> {
		if (this._info) return Promise.resolve(this._info);
		return this._getSpotifyInfo();
	}
}

export class Room {
	public id: string;
	public members: RoomMember[] = [];
	public host: RoomMember|null = null;

	private _generateID() {
		return Util.randomString(ROOM_ID_LENGTH);		
	}

	private _setDestroyTimeout() {
		setTimeout(this.destroy, ROOM_TIMEOUT);
	}

	constructor() {
		this.id = this._generateID();
		roomMap.set(this.id, this);
		this._setDestroyTimeout();
	}

	public destroy() {
		roomMap.delete(this.id);
	}

	public addMember(authData: SpotifyTypes.Endpoints.AuthToken, isHost: boolean) {
		const member = new RoomMember(authData);
		this.members.push(member);
		if (isHost) {
			this.host = member;	
		}
	}
}

export namespace Rooms {
	export function create() {
		return new Room();
	}

	export function get(id: string) {
		return roomMap.get(id);
	}

	export async function addToRoom(roomID: string, authData: SpotifyTypes.Endpoints.AuthToken, isHost: boolean) {
		const room = Rooms.get(roomID);
		if (room) {
			room.addMember(authData, isHost);
		}
	}
}