// import styled from 'styled-components';
// import { DatePicker } from 'antd';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './home/Home';
import React from "react";
import "./App.css";

export default class AppRouter extends React.Component {
	render() {
		return (
			<Router>
				<Route exact path="/">
					<Home />
				</Route>
			</Router>
		)
	}
}