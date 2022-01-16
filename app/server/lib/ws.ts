import { WebsocketMessage } from "../../shared/ws";
import * as express from "express";
import { Rooms } from "./rooms";
import * as WebSocket from "ws";

export namespace WS {
    export async function subscribe(ws: WebSocket, req: express.Request) {
        const id = req.params["id"];
        const room = Rooms.getFromXHR(id);
        const activeMember = room ? Rooms.getActiveMember(room, req) : null;

        if (!room || !activeMember) {
            ws.send(
                JSON.stringify({
                    type: "connect",
                    success: false,
                    error: "No room found",
                })
            );
            return;
        }

        ws.onclose = () => {
            room.unsubscribe(ws);
        };
        ws.onmessage = (e) => {
            if (e.data.toString() === "ping") {
                ws.send("pong");
            } else if (e.data.toString() === "pong") {
                // Do nothing
            }
        };
        room.subscribe(activeMember, (message) => {
            ws.send(JSON.stringify(message));
        });
        activeMember.subscribe((message) => {
            ws.send(JSON.stringify(message));
        });
        const msg = {
            type: "update",
            success: true,
            ...room.getUpdateData(activeMember),
        } as WebsocketMessage;
        ws.send(JSON.stringify(msg));
    }
}
