import { Verticalcenterer } from "../../../shared/styles";
import { Spin } from "antd";
import React from "react";

export default function Playlist({ id }: { id: string | null }) {
    if (!id) {
        // TODO: Loading screen
        return (
            <Verticalcenterer>
                <Spin style={{ width: "100%" }} size="large" />
            </Verticalcenterer>
        );
    }

    return (
        <iframe
            title="spotify-playlist"
            src={`https://open.spotify.com/embed/playlist/${id}`}
            style={{ minHeight: "70vh", width: "100%" }}
            //@ts-ignore
            frameborder="0"
            allowtransparency="true"
            allow="encrypted-media"
        ></iframe>
    );
}
