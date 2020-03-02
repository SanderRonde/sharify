import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/home/Home';
import React from "react";

export default class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Route exact path="/">
					<Home />
				</Route>
				<Route path="/new_room">
					<Home />
				</Route>
			</Router>
		)
	}
}