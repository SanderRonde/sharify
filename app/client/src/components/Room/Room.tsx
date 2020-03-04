import { Background } from '../shared/styles';
import Content from './Content/Content';
import Header from './Header/Header';
import { Page } from './styles';
import React from 'react';

const DEBUG = true;
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

export interface RoomMember {
    id: string;
    isHost: boolean;
    isAdmin: boolean;
    isMe: boolean;
    image: string | null;
    name: string;
    email: string;
}

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
