import styled from 'styled-components';

export const Background = styled.div`
	background-color: #282c34;
	display: flex;
	flex-direction: row;
	justify-content: center;
	font-size: calc(20px + 2vmin);
	color: white;
	height: 100vh;
	width: 100vw;
`;

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	text-align: center;
`;

export const Logo = styled.img`
	width: 512px;
	height: 512px;
`;

export const Link = styled.a`
	color: white;
	text-decoration: underline;

	&:hover {
		text-decoration: underline;
	}
`;