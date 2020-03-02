import { Background, Content, Logo, Link } from "./styles";
import React from "react";

export default class Home extends React.Component {
	render() {
		return (
			<Background>
				<Content>
					<Logo src="logo512.png" alt="logo" />
					<Link href="/api/new-room" title="Create a room">
						Create a room
					</Link>
				</Content>
			</Background>
		);
	}
}
