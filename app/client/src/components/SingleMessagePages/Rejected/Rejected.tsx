import { Content, ErrorMessage, ErrorLogo, Link } from "../styles";
import { Background } from "../../shared/styles";
import { useParams } from "react-router-dom";
import { Tooltip } from "antd";
import React from "react";

const Rejected = () => {
    const { url } = useParams();
    return (
        <Background>
            <Content>
                <Tooltip title="Go back to the homepage">
                    <ErrorLogo href="/" title="go back to the homepage" />
                </Tooltip>
                <ErrorMessage>{"Please accept the permissions"}</ErrorMessage>
                <Link href={url} title="Try to join again">
                    Try again
                </Link>
            </Content>
        </Background>
    );
};
export default Rejected;
