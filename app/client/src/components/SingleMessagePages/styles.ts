import styled from 'styled-components';

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	text-align: center;
`;

export const Logo = styled.img`
	width: 60vmin;
	height: 60vmin;
`;

export const Link = styled.a`
	color: white;
	text-decoration: underline;

	&:hover {
		text-decoration: underline;
	}
`;

export const ErrorLogo = styled.a`
	mask-image: url(logo512.png);
    background-color: red;
    mask-size: contain;
	width: 60vmin;
	height: 60vmin;
`;

export const ErrorMessage = styled.span`
	color: #F44336;
	font-weight: bold;
`;