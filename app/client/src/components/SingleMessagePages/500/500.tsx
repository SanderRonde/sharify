import { Content, ErrorMessage, ErrorLogo } from "../styles";
import { Background } from "../../shared/styles";
import { useParams } from "react-router-dom";
import { Tooltip } from "antd";
import React from "react";

const FiveHundred = () => {
    const { reason } = useParams();
    return (
        <Background>
            <Content>
                <Tooltip title="Go back to the homepage">
                    <ErrorLogo href="/" title="go back to the homepage" />
                </Tooltip>
                <ErrorMessage>
                    {reason || "500 internal server error"}
                </ErrorMessage>
            </Content>
        </Background>
    );
};
export default FiveHundred;
