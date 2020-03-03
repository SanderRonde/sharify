import { Verticalcenterer } from '../../../shared/styles';
import { useState } from 'react';
import { Spin } from 'antd';
import React from 'react';

export default function Playlist({ id }: { id: string | null }) {
    const [isLoading, setLoading] = useState<boolean>(true);

    if (!id) {
        return (
            <Verticalcenterer>
                <Spin style={{ width: '100%' }} size="large" />
            </Verticalcenterer>
        );
    }

    return (
        <Verticalcenterer>
            <Spin style={{ width: '100%' }} size="large" spinning={isLoading} delay={500}>
                <iframe
                    title="spotify-playlist"
                    src={`https://open.spotify.com/embed/playlist/${id}`}
                    style={{ minHeight: '70vh', width: '100%' }}
                    frameBorder="0"
                    //@ts-ignore
                    allowtransparency="true"
                    allow="encrypted-media"
                    onLoad={() => setLoading(false)}
                ></iframe>
            </Spin>
        </Verticalcenterer>
    );
}
