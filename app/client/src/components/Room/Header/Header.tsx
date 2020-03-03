import { IconTune } from "../../shared/icons";
import { Button, Tooltip } from "antd";
import styled from "styled-components";
import media from "styled-media-query";
import React from "react";

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-top: 5%;
`;

const Logo = styled.img`
    width: calc(51px + 4vmin);
    height: calc(51px + 4vmin);
`;

const Title = styled.div`
    ${media.lessThan("small")`
		display: none;
	`}
    display: inline-block;
    font-size: calc(40px + 4vmin);
    vertical-align: middle;
`;

const VerticalCenter = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

export default class Header extends React.Component {
    render() {
        return (
            <HeaderContainer>
                <VerticalCenter>
                    <Tooltip title="Home">
                        <a href="/">
                            <Logo src="/logo192.png" alt="logo" />
                        </a>
                    </Tooltip>
                </VerticalCenter>
                <VerticalCenter>
                    <Title>{"Sharify"}</Title>
                </VerticalCenter>

                <VerticalCenter>
                    <Tooltip title="Settings">
                        <Button
                            style={{
                                width: "calc(54px + 2.8vmin)",
                                height: "calc(54px + 2.8vmin)",
                                padding: "calc(7.8px + 0.5vmin)",
                            }}
                            size="large"
                            shape="circle-outline"
                            icon={
                                <IconTune size='calc(37px + 1.4vmin)' fill={"white"} />
                            }
                        />
                    </Tooltip>
                </VerticalCenter>
            </HeaderContainer>
        );
    }
}
