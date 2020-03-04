import {
    Recommendations,
    SpotifyRecommendations,
} from './spotify-recommendations';
import { ROOM_ID_LENGTH, ROOM_TIMEOUT, USER_ID_LENGTH } from './constants';
import { WebsocketMessage, UpdateMessageData } from '../../shared/ws';
import { SpotifyTypes } from '../types/spotify';
import { Spotify } from './spotify';
import * as express from 'express';
import { Util } from './util';

const roomMap: Map<string, Room> = new Map();

export interface UserInfo {
    name: string;
    email: string;
    id: string;
    image: string|null;
}

export class RoomMember {
    public api!: Spotify.API.APIInstance;

    // ID used to refer to this user
    public readonly internalID = (() => {
        const id = Util.randomString(USER_ID_LENGTH);
        this.room.memberIDMap.set(id, this);
        return id;
    })();

    // Secret only this user "knows"
    public readonly secretID = Util.randomString(USER_ID_LENGTH);

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
                image: null
            };
        const { display_name, email, id, images = [] } = await response.json();
        return {
            name: display_name,
            email,
            id,
            image: images.length ? images[0].url : null
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
}

type RoomListener = (message: WebsocketMessage) => void;

export class Room {
    public id: string;
    public members: RoomMember[] = [];
    public host: RoomMember | null = null;
    public admins: RoomMember[] = [];
    public recommendations: Recommendations = SpotifyRecommendations.create(
        this
    );
    public memberIDMap: Map<string, RoomMember> = new Map();

    private _listeners: Map<
        any,
        {
            listener: RoomListener;
            member: RoomMember;
        }
    > = new Map();

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

    public notifyUpdate(
        subset: Partial<
            {
                [P in keyof UpdateMessageData]: boolean;
            }
        > = {}
    ) {
        this._listeners.forEach(({ listener, member }) => {
            listener({
                type: 'update',
                success: true,
                ...this.getUpdateData(member, subset),
            });
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
            this.admins?.push(member);
        }

        if (!Util.isDev()) {
            await this._filterUniqueUsers();
        }

        // If the user was a duplicate and was filtered out,
        // don't notify others
        if (this.members.indexOf(member) == -1) return null;

        // Notify of member join
        this.notifyUpdate({
            members: true,
        });

        // Don't await this since it might take a while and should happen
        // in the background
        this.recommendations.addMember(member);

        return member;
    }

    public subscribe(
        identifier: any,
        member: RoomMember,
        listener: RoomListener
    ) {
        this._listeners.set(identifier, { listener, member });
    }

    public getUpdateData(
        callingMember: RoomMember,
        subset: Partial<
            {
                [P in keyof UpdateMessageData]: boolean;
            }
        > | null = null
    ): Partial<UpdateMessageData> {
        const fullData: UpdateMessageData = {
            playlistID: this.recommendations.playlist?.id || undefined,
            members: this.members.map((member) => {
                return {
                    id: member.internalID,
                    isHost: this.host === member,
                    isAdmin: this.admins.includes(member),
                    isMe: callingMember === member,
                    name: member.info.name,
                    email: member.info.email,
                    image: member.info.image
                };
            }),
        };

        if (subset === null) return fullData;
        return Util.pick(fullData, Object.keys(subset) as (keyof UpdateMessageData)[]);
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

    export function getActiveMember(room: Room, req: express.Request) {
        if (!(room.id in req.signedCookies)) {
            return null;
        }

        const userIDs = Buffer.from(
            req.signedCookies[room.id],
            'base64'
        ).toString('utf8');
        const publicID = userIDs.slice(0, USER_ID_LENGTH);
        const secretID = userIDs.slice(USER_ID_LENGTH);
        if (!room.memberIDMap.has(publicID)) return null;

        const member = room.memberIDMap.get(publicID)!;
        if (member.secretID === secretID) return member;

        return null;
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
