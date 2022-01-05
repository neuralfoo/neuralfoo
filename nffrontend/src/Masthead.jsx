import React from 'react';
import "./Masthead.css"

// import { NavLink } from "react-router-dom";
import { authtoken, resetAuthToken } from './globals'
import { NavLink,useHistory } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import endpoints from "./endpoints"


function Masthead(props) {

	const auth = authtoken.use()
	const history = useHistory();

	var logout = () => {
		props.cookies.set('token', '', { path: '/' });
		resetAuthToken();
		history.push(endpoints.login);
	}

	return (
		<div className="masthead-holder">
			<NavLink to="/" className="masthead-title">Neural Foo</NavLink>
			
			{
				(auth === "" || auth === undefined) ? 
				<div className="masthead-nav">
					<NavLink to={endpoints.login} activeClassName="masthead-nav-link-active" className="masthead-nav-link">Login</NavLink>
					<NavLink to={endpoints.signup} activeClassName="masthead-nav-link-active" className="masthead-nav-link">Sign up</NavLink>
				</div>
				 :
				<div className="masthead-nav">
					<NavLink to={endpoints.dashboard} activeClassName="masthead-nav-link-active" className="masthead-nav-link">Dashboard</NavLink> 
					<NavLink to={endpoints.settings} activeClassName="masthead-nav-link-active" className="masthead-nav-link">Settings</NavLink> 
					|
					<button className="masthead-nav-link" onClick={logout}>Logout</button>
					<ToastContainer />
				</div>
			}			
			
		</div>
		)

}

export default Masthead