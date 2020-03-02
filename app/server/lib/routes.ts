import { SPOTIFY_HOST_SCOPES, REDIRECT_PATH, FRONTEND_URL, SPOTIFY_PEER_SCOPES, SPOTIFY_COLOR } from './constants';
import { Spotify } from './spotify';
import * as ws from 'express-ws';
import * as QRCode from 'qrcode';
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
        await Rooms.addToRoom(state.room, await authData.json(), state.host);

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
    app.get('/room/:id', async (req, res) => {
        const room = Rooms.get(req.params['id'], res);
		if (!room) return;

        // TODO: make this something fancy
        res.status(200);
        const hostInfo = (() => {
            if (!room.host) return 'None';
            const info = room.host.info;
            return `${info.name} (${info.email})`;
        })();
        const memberData = room.members.map(( { info: { email, name } }) => {
            return `${name} (${email})`;
		});
		const inviteLink = `${FRONTEND_URL}/room/${room.id}/join`;
		const qrData = await QRCode.toString(inviteLink, {
			color: {
				dark: SPOTIFY_COLOR,
				light: '#ffffff'
			},
			type: 'svg'
		});
        res.write(
			`<html><head><title>Room ${room.id}</title></head><body>
			Welcome to the room. <br>
			Host is <div id="hostInfo">${hostInfo}</div><br> 
			Current members are:<br><ul id="members"> ${memberData.map((data) => {
				return `<li>${data}</li>`;
			}).join('')}
			</ul>
			<a href="${inviteLink}" target="_blank">Invite link</a>
			<svg>${qrData}</svg>
			<script src="/room/room.js" type="module"></script>
			</body></html>`
        );
        res.end();
	});
	app.ws('/room/:id', (ws, req) => {
		const id = req.params['id'];
		const room = Rooms.get(id);
		
		if (!room) {
			ws.send({
				type: 'connect',
				success: false,
				error: 'No room found'
			});
			return;
		}

		ws.onclose = () => {
			room.unsubscribe(ws);
		}
		room.subscribe(ws, (message) => {
			ws.send(JSON.stringify(message));
		});
	});
}
