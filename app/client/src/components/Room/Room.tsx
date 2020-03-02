import { Background } from '../shared/styles';
import { useParams } from 'react-router-dom';
import Header from './Header/Header';
import { Content } from './styles';
import React from "react";

export default function Room() {
	const { roomID } = useParams();
	console.log(roomID);
	return (
		<Background>
			<Content>
				<Header />
			</Content>
		</Background>
	);
}
