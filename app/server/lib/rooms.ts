import {
    Recommendations,
    SpotifyRecommendations,
} from './spotify-recommendations';
import { ROOM_ID_LENGTH, ROOM_TIMEOUT } from './constants';
import { WebsocketMessages } from '../../shared/ws';
import { SpotifyTypes } from '../types/spotify';
import { Spotify } from './spotify';
import * as express from 'express';
import { Util } from './util';

const roomMap: Map<string, Room> = new Map();
const memberIDMap: Map<string, RoomMember> = new Map();

export interface UserInfo {
    name: string;
    email: string;
    id: string;
}

export class RoomMember {
    public api!: Spotify.API.APIInstance;
    public readonly internalID = (() => {
        const id = Util.randomString(32);
        memberIDMap.set(id, this);
        return id;
    })();

    constructor(
        public room: Room,
        private _auth: SpotifyTypes.Endpoints.AuthToken
    ) {}

    async init() {
        this.api = new Spotify.API.APIInstance({
            accessToken: this._auth.access_token,
            expiresIn: this._auth.expires_in,
            refreshToken: this._auth.refresh_token,
        });
        this._info = await this._getSpotifyInfo();
        this.api.setID(this.info.id);
        return this;
    }

    private _info: null | UserInfo = null;
    private async _getSpotifyInfo(): Promise<UserInfo> {
        const response = await this.api.endpoints.me();
        if (!response)
            return {
                email: '?',
                id: '?',
                name: '?',
            };
        const { display_name, email, id } = await response.json();
        return {
            name: display_name,
            email,
            id,
        };
    }

    public get info() {
        return this._info!;
    }

    public async toJSON() {
        return {
            name: this.info.name,
            email: this.info.email,
        };
    }

    public destroy() {
        memberIDMap.delete(this.internalID);
    }
}

type RoomListener = (message: WebsocketMessages) => void;

export class Room {
    public id: string;
    public members: RoomMember[] = [];
    public host: RoomMember | null = null;
    public recommendations: Recommendations = SpotifyRecommendations.create(
        this
    );

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
        this.members.forEach((member) => member.destroy());
    }

    private async _filterUniqueUsers() {
        const memberInfos = await Promise.all(
            this.members.map(async (member) => {
                return {
                    member: member,
                    info: member.info,
                };
            })
        );
        const seenMemberIDs = new Set<string>();
        this.members = memberInfos
            .filter(({ info }) => {
                if (seenMemberIDs.has(info.id)) {
                    return false;
                }
                seenMemberIDs.add(info.id);
                return true;
            })
            .map(({ member }) => member);
    }

    public notify(message: WebsocketMessages) {
        this._listeners.forEach((listener) => {
            listener(message);
        });
    }

    public async addMember(
        authData: SpotifyTypes.Endpoints.AuthToken,
        isHost: boolean
    ) {
        const member = await new RoomMember(this, authData).init();
        this.members.push(member);
        if (isHost) {
            this.host = member;
        }

        if (!Util.isDev()) {
            await this._filterUniqueUsers();
        }

        // If the user was a duplicate and was filtered out,
        // don't notify others
        if (this.members.indexOf(member) == -1) return null;

        this.notify({
            type: 'join',
            success: true,
            members: await Promise.all(
                this.members.map(async (member) => {
                    const info = await member.toJSON();
                    return {
                        ...info,
                        isHost: this.host === member,
                    };
                })
            ),
        });

        // Don't await this since it might take a while and should happen
        // in the background
        this.recommendations.addMember(member);

        return member;
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

    export function get(id: string): Room | null;
    export function get(id: string, res: express.Response): Room | null;
    export function get(id: string, res?: express.Response): Room | null {
        const room = roomMap.get(id);
        if (!room && res) {
            res.status(404);
            res.write('No room with that ID');
            res.end();
        }
        return room || null;
    }

    export async function addToRoom(
        roomID: string,
        authData: SpotifyTypes.Endpoints.AuthToken,
        isHost: boolean
    ) {
        const room = Rooms.get(roomID);
        if (room) {
            return await room.addMember(authData, isHost);
        }
        return null;
    }
}
