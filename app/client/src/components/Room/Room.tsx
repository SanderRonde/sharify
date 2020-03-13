import { WebsocketMessage, RoomMember } from '../../../../shared/ws';
import { Background } from '../shared/styles';
import Content from './Content/Content';
import Header from './Header/Header';
import { notification } from 'antd';
import { Page } from './styles';
import React from 'react';

interface Props {
    id: string;
}

class Room extends React.Component<
    Props,
    {
        playlistID: string | null;
        members: RoomMember[];
    }
> {
    state = {
        playlistID: null,
        members: [],
    };

    handleMessage(message: WebsocketMessage) {
        switch (message.type) {
            case 'connect':
                if (message.success === false) {
                    // Failed to connect, redirect to 404
                    notification.open({
                        message: 'Room not found',
                        description:
                            "Room does not exist or you're not a member",
                    });
                    window.location.href = '/404';
                    break;
                }
                break;
            case 'update':
                if (message.success) {
                    this.setState({
                        members: message.members || this.state.members,
                        playlistID: message.playlistID || this.state.playlistID,
                    });
                } else {
                    notification.open({
                        message: 'Something went wrong',
                        description: 'Something went wrong fetching updates',
                    });
                }
                break;
        }
    }

    onMessage(message: MessageEvent) {
        const data = JSON.parse(message.data) as WebsocketMessage;
        this.handleMessage(data);
    }

    connect() {
        const isSecure = window.location.protocol === 'https:';
        const protocol = isSecure ? 'wss' : 'ws';
        const ws = new WebSocket(
            `${protocol}://${window.location.host}/ws/room/${this.props.id}`
        );
        ws.onmessage = (m) => {
            if (m.data === 'pong') return;
            this.onMessage(m);
        }
        const interval = window.setInterval(() => {
            ws.send('ping');
        }, 1000 * 60);
        ws.onclose = () => {
            window.clearInterval(interval);
            notification.open({
                message: 'Disconnected',
                description: 'Disconnected from server, reconnecting in 15 seconds'
            });
            setTimeout(() => this.connect, 15 * 1000);
        }
    }

    componentDidMount() {
        this.connect();
    }

    render() {
        return (
            <Background>
                <Page>
                    <Header />
                    <Content
                        members={this.state.members}
                        roomID={this.props.id}
                        playlistID={this.state.playlistID}
                    />
                </Page>
            </Background>
        );
    }
}

export default Room;
