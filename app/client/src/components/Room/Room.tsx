import { Background } from "../shared/styles";
import Content from "./Content/Content";
import Header from "./Header/Header";
import { Page } from "./styles";
import React from "react";

const DEBUG = true;

export interface RoomMember {}

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
    constructor(props: Props, context?: any) {
        super(props, context);

        this.state = {
            playlistID: DEBUG ? '1lJr8Bej7l1x69s582H4wo' : null,
            members: [],
        };
    }

    render() {
        return (
            <Background>
                <Page>
                    <Header />
                    <Content
                        members={this.state.members}
                        playlistID={this.state.playlistID}
                    />
                </Page>
            </Background>
        );
    }
}

export default Room;
