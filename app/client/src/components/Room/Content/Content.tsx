import MemberList from "./MemberList/MemberList";
import Playlist from "./Playlist/Playlist";
import { Gutter } from "antd/lib/grid/row";
import { Container } from "./styles";
import { Col, Row } from "antd";
import { RoomMember } from "../Room";
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
                gutter={[16, 16] as [Gutter, Gutter]}
				style={{ flexGrow: 100 }}
            >
                <Col md={18} xs={24}>

                    <Playlist id={playlistID} />
                </Col>
                <Col md={6} xs={24}>
                    <MemberList members={members} />
                </Col>
            </Row>
        </Container>
    );
}
