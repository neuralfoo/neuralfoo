import './App.css';
import React,{useLayoutEffect} from 'react';
import Login from './Login';
import Signup from './Signup';
import Masthead from './Masthead';
import Dashboard from './Dashboard';
import Testboard from './Testboard';
import Settings from './Settings';
import AccuracyTestReport from './AccuracyTestReport';
import FunctionalTestReport from './FunctionalTestReport';

import { authtoken,setAuthToken } from './globals';

import Cookies from 'universal-cookie';

import endpoints from './endpoints';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";



function App() {

  authtoken.use()

  const cookies = new Cookies();

  useLayoutEffect(() => {
    setAuthToken(cookies.get('token'))
    document.title = "Neural Foo"
  }, []);

  return (

    <Router>
      <div className="App">
        <Masthead  cookies={cookies}/>
        <Switch>
          <Route path={endpoints.login}>
            <Login  cookies={cookies}/>
          </Route>

          <Route path={endpoints.signup}>
            <Signup  cookies={cookies}/>
          </Route>

          <Route path={endpoints.onboardMember}>
            <Signup  cookies={cookies}/>
          </Route>

          <Route path={endpoints.dashboard}>      
            <Dashboard  cookies={cookies} />
          </Route>

          <Route path={endpoints.settings}>      
            <Settings  cookies={cookies} />
          </Route>

          <Route path={endpoints.newTestboard}>
            <Testboard cookies={cookies} /> 
          </Route>

          <Route path={endpoints.getTestboard}>
            <Testboard cookies={cookies} />
          </Route>

          <Route path={endpoints.accuracyReport}>
            <AccuracyTestReport cookies={cookies} />
          </Route>

          <Route path={endpoints.functionalReport}>
            <FunctionalTestReport cookies={cookies} />
          </Route>

          <Route exact path="/">
            Home
          </Route>

          <Route path="*">
              404 - Page Not Found
          </Route>
        </Switch>
      </div>
    </Router>

  );
}

export default App;
