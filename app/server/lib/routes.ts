import {
	REDIRECT_PATH,
} from './constants';
import * as ws from 'express-ws';
import { API } from './api';

export function initRoutes(app: ws.Application) {
    app.get('/api/new-room', async (_, res) => {
        await API.Rest.newRoom(res);
    });
    app.get(REDIRECT_PATH, async (req, res) => {
        await API.Rest.onRedirect(req, res);
    });
    app.get('/api/room/:id/join', async (req, res) => {
        await API.Rest.joinRoom(req, res);
    });
    app.ws('/ws/room/:id', (ws, req) => {
        API.WS.subscribe(ws, req);
    });
}
