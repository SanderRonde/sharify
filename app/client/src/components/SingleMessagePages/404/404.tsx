import { Content, ErrorMessage, ErrorLogo } from '../styles';
import { Background } from '../../shared/styles';
import React from 'react';

const FourOFour = () => {
    return (
        <Background>
            <Content>
                <ErrorLogo />
                <ErrorMessage>{"404 not found"}</ErrorMessage>
            </Content>
        </Background>
    );
};
export default FourOFour;
