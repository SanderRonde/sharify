import { Container, MemberListContainer } from "./styles";
import MemberList from "./MemberList/MemberList";
import Playlist from "./Playlist/Playlist";
import { Gutter } from "antd/lib/grid/row";
import { RoomMember } from "../Room";
import { Col, Row } from "antd";
import React from "react";

export default function Content({
    members,
    playlistID,
}: {
    playlistID: string | null;
    members: RoomMember[];
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
                        <MemberList members={members} />
                    </MemberListContainer>
                </Col>
            </Row>
        </Container>
    );
}
