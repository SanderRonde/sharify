import { BrowserRouter as Router, Route } from 'react-router-dom';
import RoomWrapper from './components/Room/Wrapper';
import Home from './components/Home/Home';
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