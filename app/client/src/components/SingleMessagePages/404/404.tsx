import { Content, ErrorMessage, ErrorLogo } from '../styles';
import { Background } from '../../shared/styles';
import { Tooltip } from 'antd';
import React from 'react';

const FourOFour = () => {
    return (
        <Background>
            <Content>
                <Tooltip title="Go back to the homepage">
                    <ErrorLogo href="/" title="go back to the homepage"/>
                </Tooltip>
                <ErrorMessage>{"404 not found"}</ErrorMessage>
            </Content>
        </Background>
    );
};
export default FourOFour;
