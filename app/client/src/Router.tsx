import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Room from './components/Room/Room';
import React from "react";

export default class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Route exact path="/">
					<Home />
				</Route>
				<Route path="/room/:roomID">
					<Room />
				</Route>
			</Router>
		)
	}
}