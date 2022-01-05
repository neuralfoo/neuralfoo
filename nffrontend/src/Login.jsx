import React, { useState } from 'react';
import './Login.css';
import { useHistory } from "react-router-dom";

import Button from '@material-ui/core/Button';

import { Input } from 'antd';

import backend from "./backend"
import axios from 'axios'
import endpoints from './endpoints'

import { resetAuthToken, setAuthToken } from './globals'


function Login(props) {


  const email = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const history = useHistory();

  // handle button click of login form
  const handleLogin = () => {
  	// console.log("hitting login API")
  	const payload = { email: email.value , password : password.value };
    axios.post(backend.login, payload)
        .then(response => { 
        	// console.log(response.data.token)
        	props.cookies.set('token', response.data.token, { path: '/' });
        	setAuthToken(response.data.token)
        	history.push(endpoints.dashboard); 
        })
        .catch(error => {
            props.cookies.set('token', '', { path: '/' });
            resetAuthToken();
            console.error(error.response.data.message);
            setError(error.response.data.message)
            // alert(error.message)
        });
  }
 
  return (
    <div className="login-holder">

    	<div className="login-box">

	    	<div className="login-title">
	    		Login
	    	</div>
      
			<div>
        <Input placeholder="Email ID" size="large"  {...email}  />
				{/*<TextField variant="outlined" autoComplete="new-password" />*/}
			</div>

			<div style={{ marginTop: 20 }}>
        <Input.Password onPressEnter={handleLogin} size="large"  {...password} placeholder="Password" />
			</div>
			
			{error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
			
      {/*disabled={loading}*/}
			<Button variant="contained"  onClick={handleLogin} color="primary">
			  Login
			</Button>
    	</div>
    </div>
  );
}
 
const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);
 
  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}
 
export default Login;
