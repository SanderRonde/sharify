import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/SingleMessagePages/Home/Home';
import RoomWrapper from './components/Room/Wrapper';
import React from "react";

export default class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Route exact path="/">
					<Home />
				</Route>
				<Route path="/room/:roomID">
					<RoomWrapper />
				</Route>
				<Route path="/404">
					{/* TODO: */}
				</Route>
			</Router>
		)
	}
}