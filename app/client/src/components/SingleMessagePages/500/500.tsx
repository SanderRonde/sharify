import { Content, ErrorMessage, ErrorLogo } from '../styles';
import { Background } from '../../shared/styles';
import React from 'react';

const FiveHundred = () => {
    return (
        <Background>
            <Content>
                <ErrorLogo />
                <ErrorMessage>{"500 internal server error"}</ErrorMessage>
            </Content>
        </Background>
    );
};
export default FiveHundred;
