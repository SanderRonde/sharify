import { Container, MemberListContainer } from "./styles";
import { RoomMember } from "../../../../../shared/ws";
import MemberList from "./MemberList/MemberList";
import Playlist from "./Playlist/Playlist";
import { Gutter } from "antd/lib/grid/row";
import { Col, Row } from "antd";
import React from "react";

export default function Content({
    members,
    playlistID,
    roomID
}: {
    playlistID: string | null;
    members: RoomMember[];
    roomID: string;
}) {
    return (
        <Container>
            <Row
                gutter={[2, 20] as [Gutter, Gutter]}
				style={{ flexGrow: 100 }}
            >
                <Col md={16} xs={24}>

                    <Playlist id={playlistID} />
                </Col>
                <Col md={8} xs={24}>
                    <MemberListContainer>
                        <MemberList roomID={roomID} members={members} />
                    </MemberListContainer>
                </Col>
            </Row>
        </Container>
    );
}
