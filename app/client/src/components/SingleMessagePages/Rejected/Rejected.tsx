import { Content, ErrorMessage, ErrorLogo, Link } from '../styles';
import { Background } from '../../shared/styles';
import { useParams } from 'react-router-dom';
import React from 'react';

const Rejected = () => {
	const { url } = useParams();
    return (
        <Background>
            <Content>
                <ErrorLogo />
                <ErrorMessage>{'Please accept the permissions'}</ErrorMessage>
				<Link href={url} title="Try to join again">
                    Try again
                </Link>
            </Content>
        </Background>
    );
};
export default Rejected;
