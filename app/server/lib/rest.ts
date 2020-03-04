import * as express from 'express';
import { Rooms } from './rooms';
import { Spotify } from './spotify';
import {
    SPOTIFY_HOST_SCOPES,
    ROOM_TIMEOUT,
    FRONTEND_URL,
    SPOTIFY_PEER_SCOPES,
} from './constants';

export namespace Rest {
    export async function newRoom(res: express.Response) {
        const room = Rooms.create();
        const url = Spotify.Authentication.generatePermissionURL(
            SPOTIFY_HOST_SCOPES,
            JSON.stringify({
                room: room.id,
                host: true,
            })
        );
        res.redirect(302, await url);
    }

    export async function onRedirect(
        req: express.Request,
        res: express.Response
    ) {
        // Authenticate
        const authData = await Spotify.Authentication.authenticateFromCode(
            req.query,
            res
        );
        if (!authData) return;

        // Get state
        const state = JSON.parse(req.query.state) as {
            room: string;
            host: boolean;
        };

        // Add to room (if possible)
        const self = await Rooms.addToRoom(
            state.room,
            await authData.json(),
            state.host
        );

        // If they're now in the room, set cookie
        if (self) {
            res.cookie(
                `${state.room}`,
                Buffer.from(self.internalID + self.secretID).toString('base64'),
                {
                    signed: true,
                    expires: new Date(Date.now() + ROOM_TIMEOUT),
                }
            );
        }

        // Redirect to room
        res.redirect(302, `${FRONTEND_URL}/room/${state.room}`);
    }

    export async function joinRoom(
        req: express.Request,
        res: express.Response
    ) {
        const room = Rooms.get(req.params['id'], res);
        if (!room) return;

        const inviteLink = await Spotify.Authentication.generatePermissionURL(
            SPOTIFY_PEER_SCOPES,
            JSON.stringify({
                room: room.id,
                host: false,
            })
        );
        res.redirect(302, inviteLink);
    }
}
