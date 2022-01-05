import React, { useState,useLayoutEffect } from 'react';
import './Signup.css';
import { useHistory,useParams } from "react-router-dom";

import Button from '@material-ui/core/Button';

import { Input } from 'antd';

import backend from "./backend"
import endpoints from "./endpoints"

import axios from 'axios'

import { resetAuthToken, setAuthToken } from './globals'


function Signup(props) {


  const email = useFormInput('');
  const firstname = useFormInput('');
  const lastname = useFormInput('');
  const organization = useFormInput('');
  
  const [disableOrganization,setDisableOrganization] = useState(false);

  const password = useFormInput('');
  const [error, setError] = useState(null);
  const history = useHistory();

  let { referralCode } = useParams();


  useLayoutEffect( () => {

    if (referralCode !== undefined){
      setDisableOrganization(true)
    }

  },[])

  const handleSignup = () => {
    var payload;

    if (referralCode !== undefined && referralCode !== ""){
      payload = { 
        email: email.value ,
        firstName: firstname.value , 
        lastName: lastname.value , 
        organization: referralCode , 
        password : password.value,
        referral:true
      };
    }
    else {
    	payload = { 
        email: email.value ,
        firstName: firstname.value , 
        lastName: lastname.value , 
        organization: organization.value , 
        password : password.value,
        referral:false 
      };
    }

    axios.post(backend.signup, payload)
        .then(response => { 
        	// console.log(response.data.token)
        	props.cookies.set('token', response.data.token, { path: '/' });
        	setAuthToken(response.data.token)
        	history.push(endpoints.dashboard); 
        })
        .catch(error => {
            props.cookies.set('token', '', { path: '/' });
            resetAuthToken();
            // console.error(error.response.data.message);
            setError(error.response.data.message)
        });
  }
 
  return (
    <div className="signup-holder">

    	<div className="signup-box">

	    	<div className="signup-title">
	    		Signup for Neural Foo
	    	</div>
      
			<div>
        <Input placeholder="Email ID" name="email" size="large"  {...email}  autoComplete="off" />
			</div>

      <div style={{ marginTop: 20 }}>
        <Input placeholder="First Name" size="large"  {...firstname}  autoComplete="off" />
      </div>

      <div style={{ marginTop: 20 }}>
        <Input placeholder="Last Name" size="large"  {...lastname} autoComplete="off" />
      </div>

      {
        disableOrganization ? null :
        <div style={{ marginTop: 20 }}>
          <Input placeholder="Origanization" size="large"  {...organization}  autoComplete="off" />
        </div>
      }
			<div style={{ marginTop: 20 }}>
        <Input.Password onPressEnter={handleSignup} size="large"  {...password} placeholder="Password" autoComplete="off" />
			</div>
			
			{error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
			
      {/*disabled={loading}*/}
			<Button variant="contained"  onClick={handleSignup} color="primary">
			  Create account
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
 
export default Signup;
