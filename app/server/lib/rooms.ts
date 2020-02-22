import { ROOM_ID_LENGTH, ROOM_TIMEOUT } from "./constants";
import { WebsocketMessages } from "../../shared/ws";
import { SpotifyTypes } from "../types/spotify";
import { Spotify } from "./spotify";
import * as express from 'express';
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

	public getInfo(): Promise<UserInfo> {
		if (this._info) return Promise.resolve(this._info);
		return this._getSpotifyInfo();
	}

	public async toJSON() {
		const info = await this.getInfo();
		return {
			name: info.name,
			email: info.email
		}
	}
}

type RoomListener = (message: WebsocketMessages) => void;

export class Room {
	public id: string;
	public members: RoomMember[] = [];
	public host: RoomMember|null = null;

	private _listeners: Map<any, RoomListener> = new Map();

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

	private async _filterUniqueUsers() {
		const memberInfos = await Promise.all(this.members.map(async (member) => {
			return {
				member: member,
				info: await member.getInfo()
			};
		}));
		const seenMemberIDs = new Set<string>();
		this.members = memberInfos.filter(({ info }) => {
			if (seenMemberIDs.has(info.id)) {
				return false;
			}
			seenMemberIDs.add(info.id);
			return true;
		}).map(({ member }) => member);
	}

	private _notify(message: WebsocketMessages) {
		this._listeners.forEach((listener) => {
			console.log(listener, message);
			listener(message);
		});
	}

	public async addMember(authData: SpotifyTypes.Endpoints.AuthToken, isHost: boolean) {
		const member = new RoomMember(authData);
		this.members.push(member);
		if (isHost) {
			this.host = member;	
		}

		console.log('Pushed member');
		if (!Util.isDev()) {
			await this._filterUniqueUsers();
		}

		// If the user was a duplicate and was filtered out,
		// don't notify others
		console.log('Checking if theyre still there');
		if (this.members.indexOf(member) == -1) return;

		console.log('Notifying');
		this._notify({
			type: 'join',
			success: true,
			members: await Promise.all(this.members.map(async (member) => {
				const info = await member.toJSON();
				return {
					...info,
					isHost: this.host === member
				}
			}))
		})
	}

	public subscribe(identifier: any, listener: RoomListener) {
		this._listeners.set(identifier, listener);
	}

	public unsubscribe(identifier: any) {
		this._listeners.delete(identifier);
	}
}

export namespace Rooms {
	export function create() {
		return new Room();
	}

	export function get(id: string): Room|null;
	export function get(id: string, res: express.Response): Room|null;
	export function get(id: string, res?: express.Response): Room|null {
		const room = roomMap.get(id);
		if (!room && res) {
			res.status(404);
            res.write('No room with that ID');
            res.end();
		}
		return room || null;
	}

	export async function addToRoom(roomID: string, authData: SpotifyTypes.Endpoints.AuthToken, isHost: boolean) {
		console.log('Someone joined the room', authData);
		const room = Rooms.get(roomID);
		if (room) {
			await room.addMember(authData, isHost);
		}
	}
}