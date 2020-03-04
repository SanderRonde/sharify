import {
	SPOTIFY_HOST_SCOPES,
    REDIRECT_PATH,
    FRONTEND_URL,
    SPOTIFY_PEER_SCOPES,
    ROOM_TIMEOUT,
} from './constants';
import { WebsocketMessage } from '../../shared/ws';
import { Spotify } from './spotify';
import * as ws from 'express-ws';
import { Rooms } from './rooms';

export function initRoutes(app: ws.Application) {
    app.get('/api/new-room', async (_, res) => {
        const room = Rooms.create();
        const url = Spotify.Authentication.generatePermissionURL(
            SPOTIFY_HOST_SCOPES,
            JSON.stringify({
                room: room.id,
                host: true,
            })
        );
        res.redirect(302, await url);
    });
    app.get(REDIRECT_PATH, async (req, res) => {
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
    });
    app.get('/api/room/:id/join', async (req, res) => {
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
    });
    app.ws('/ws/room/:id', (ws, req) => {
        const id = req.params['id'];
        const room = Rooms.get(id);
        const activeMember = room ? Rooms.getActiveMember(room, req) : null;

        if (!room || !activeMember) {
            ws.send(
                JSON.stringify({
                    type: 'connect',
                    success: false,
                    error: 'No room found',
                })
            );
            return;
        }

        ws.onclose = () => {
            room.unsubscribe(ws);
        };
        room.subscribe(ws, activeMember, (message) => {
            ws.send(JSON.stringify(message));
		});
		const msg = {
			type: 'update',
			success: true,
			...room.getUpdateData(activeMember),
		} as WebsocketMessage;
		console.log(msg);
        ws.send(
            JSON.stringify(msg)
        );
    });
}
