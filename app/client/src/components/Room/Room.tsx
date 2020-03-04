import { WebsocketMessage, RoomMember } from '../../../../shared/ws';
import { Background } from '../shared/styles';
import Content from './Content/Content';
import Header from './Header/Header';
import { Page } from './styles';
import React from 'react';
import { notification } from 'antd';

const DEBUG = false;
const DEBUG_HOST = true;
const DEFAULT_STATE = {
    playlistID: '1lJr8Bej7l1x69s582H4wo',
    members: [
        {
            id: 'something',
            isAdmin: false,
            isMe: false,
            image: null,
            name: 'Sander Normal',
            email: 'awsdfgvhbjn@gmail.com',
        },
        {
            id: 'something1',
            isAdmin: true,
            isMe: false,
            image: null,
            name: 'Sander Host',
            email: 'awsdfgvhbjn@gmail.com',
        },
        {
            id: 'something2',
            isHost: DEBUG_HOST,
            isAdmin: true,
            isMe: true,
            image: null,
            name: 'Sander Me',
            email: 'awsdfgvhbjn@gmail.com',
        },
        {
            id: 'something3',
            isAdmin: false,
            isMe: false,
            image:
                'https://help.seesaw.me/hc/en-us/article_attachments/203872726/cow.png',
            name: 'Sander Image',
            email: 'awsdfgvhbjn@gmail.com',
        },
        {
            id: 'something4',
            isAdmin: false,
            isMe: false,
            image:
                'https://help.seesaw.me/hc/en-us/article_attachments/203872726/cow.png',
            name: 'Sander Image',
            email: 'awsdfgvhbjn@gmail.com',
        },
        {
            id: 'something5',
            isAdmin: false,
            isMe: false,
            image:
                'https://help.seesaw.me/hc/en-us/article_attachments/203872726/cow.png',
            name: 'Sander Image',
            email: 'awsdfgvhbjn@gmail.com',
        },
    ] as RoomMember[],
};

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
    state = DEBUG
        ? DEFAULT_STATE
        : {
              playlistID: null,
              members: [],
          };

    handleMessage(message: WebsocketMessage) {
        switch (message.type) {
            case 'connect':
                if (message.success === false && !DEBUG) {
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
        const isSecure = window.location.protocol === 'https';
        const protocol = isSecure ? 'wss' : 'ws';
        const ws = new WebSocket(
            `${protocol}://${window.location.host}/ws/room/${this.props.id}`
        );
        ws.onmessage = (m) => this.onMessage(m);
        ws.onclose = () => {
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
