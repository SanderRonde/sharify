import { Content, Logo, Link } from "./styles";
import { Background } from '../shared/styles';
import React from "react";

const Home = () => {
    return (
        <Background>
            <Content>
                <Logo src="logo512.png" alt="logo" />
                <Link href="/api/new-room" title="Create a room">
                    Create a room
                </Link>
            </Content>
        </Background>
    );
};
export default Home;