import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Rejected from './components/SingleMessagePages/Rejected/Rejected';
import FiveHundred from './components/SingleMessagePages/500/500';
import FourOFour from './components/SingleMessagePages/404/404';
import Home from './components/SingleMessagePages/Home/Home';
import RoomWrapper from './components/Room/Wrapper';
import React from 'react';

export default class AppRouter extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Home />
                    </Route>
                    <Route path="/room/:roomID">
                        <RoomWrapper />
                    </Route>
                    <Route path="/500/:reason?">
                        <FiveHundred />
                    </Route>
                    <Route path="/rejected/:url">
                        <Rejected />
                    </Route>
                    <Route path="*">
                        <FourOFour />
                    </Route>
                </Switch>
            </Router>
        );
    }
}
