import * as express from 'express';
import { Rooms, RoomMember, Room } from './rooms';
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
            res,
            await authData.json(),
            state.host
        );

        // Redirected already, return
        if (!self) return;

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
        const room = Rooms.getFromNav(req.params['id'], res);
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

    function getRoomFromPost(req: express.Request, res: express.Response) {
        const roomID = req.body['room'];
        const room = Rooms.getFromXHR(roomID);
        const activeMember = room ? Rooms.getActiveMember(room, req) : null;

        if (!room || !activeMember) {
            res.status(404);
            res.send({
                success: false,
                error: 'No room found',
            });
            return null;
        }

        return { room, activeMember };
    }

    function assertIsHost(member: RoomMember, res: express.Response) {
        if (!member.isHost) {
            res.status(401);
            res.send({
                success: false,
                error: 'Not allowed',
            });
            return null;
        }

        return true;
    }

    function getTargetFromPost(
        req: express.Request,
        res: express.Response,
        room: Room
    ) {
        const targetUserID = req.body['userID'];
        const targetUser = targetUserID
            ? Rooms.getMemberById(room, targetUserID)
            : null;

        if (!targetUserID || !targetUser) {
            res.status(404);
            res.send({
                success: false,
                error: 'User not found',
            });
            return null;
        }

        return targetUser;
    }

    /**
     * Params:
     *
     * {string} room - The ID of the room this is about
     * {string} userID - The ID of the target
     * {boolean} status - The target admin status of the user
     */
    export async function setAdminStatus(
        req: express.Request,
        res: express.Response
    ) {
        const result = getRoomFromPost(req, res);
        if (!result) return;

        const { activeMember, room } = result;
        if (!assertIsHost(activeMember, res)) return;

        const targetUser = getTargetFromPost(req, res, room);
        if (!targetUser) return;

        const targetValue = req.body['status'];
        if (typeof targetValue !== 'boolean') {
            res.status(400);
            res.send({
                success: false,
                error: 'Invalid value for status',
            });
            return;
        }

        targetUser.setAdminStatus(targetValue);
        res.status(200);
        res.send({
            success: true,
        });
    }

    /**
     * Params:
     *
     * {string} room - The ID of the room this is about
     * {string} userID - The ID of the target
     */
    export async function kickUser(
        req: express.Request,
        res: express.Response
    ) {
        const result = getRoomFromPost(req, res);
        if (!result) return;

        const { activeMember, room } = result;
        if (!assertIsHost(activeMember, res)) return;

        const targetUser = getTargetFromPost(req, res, room);
        if (!targetUser) return;

        const kicked = targetUser.kick();
        res.status(200);
        res.send({
            success: true,
            kicked: kicked,
        });
    }
}
