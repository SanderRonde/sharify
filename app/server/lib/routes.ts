import { SPOTIFY_HOST_SCOPES, REDIRECT_PATH, HOST_URL } from './constants';
import { Spotify } from './spotify';
import * as express from 'express';
import { Rooms } from './rooms';

export function initRoutes(app: express.Express) {
    app.get('/new_room', async (_, res) => {
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
        Rooms.addToRoom(state.room, await authData.json(), state.host);

		// Redirect to room
		res.redirect(302, `${HOST_URL}/room/${state.room}`);
	});
	app.get('/room/:id', async (req, res) => {
		const roomID = req.params['id'];
		const room = Rooms.get(roomID);
		if (!room) {
			res.status(404);
			res.write('No room with that ID');
			res.end();
			return;
		}

		// TODO: make this something fancy
		res.status(200);
		const hostInfo = await (async() => {
			if (!room.host) return 'None';
			const info =await room.host.getInfo();
			return `${info.name} (${info.email})`;
		})();
		const membersInfos = await Promise.all(room.members.map((member) => {
			return member.getInfo();
		}));
		const memberData = membersInfos.map(({ email, name }) => {
			return `${name} (${email})`
		});
		res.write(`Welcome to the room. Host is ${hostInfo}.\n Current members are:\n ${memberData.join('\n')}`);
		res.end();
	});
}