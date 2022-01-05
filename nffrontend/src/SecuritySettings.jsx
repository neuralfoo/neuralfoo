import React, { useState } from 'react';
import './SecuritySettings.css';
import { useHistory } from "react-router-dom";

// import Button from '@material-ui/core/Button';

import { Input,Button } from 'antd';

import backend from "./backend"
import axios from 'axios'

import notif from "./notification"

import endpoints from "./endpoints"

import { authtoken,resetAuthToken } from './globals'


function SecuritySettings(props) {

  authtoken.use()
  
  const useFormInput = initialValue => {
    const [value, setValue] = useState(initialValue);
   
    const handleChange = e => {
      if (typeof e == "string"){
        setValue(e);
      }
      else{
        setValue(e.target.value);  
      }
    }
    return {
      value,
      onChange: handleChange
    }
  }

  const oldPassword = useFormInput('');
  const newPassword = useFormInput('');
  const newPasswordagain = useFormInput('');
  const history = useHistory();


  const changePassword = () => {

    if (newPassword.value !== newPasswordagain.value){
      notif.error("New Passwords do not match")
      return
    }

    if (newPassword.value === ""){
      notif.error("New Password cannot be empty")
      return
    }

    const payload = {
      oldPassword:oldPassword.value,
      newPassword:newPassword.value
    }
    axios.post(backend.changePassword,payload,
    { 
        headers: {"Authorization" : props.cookies.get('token')}
    })
    .then(response => { 
      oldPassword.onChange("")
      newPassword.onChange("")
      newPasswordagain.onChange("")
      notif.success("Password updated successfully.")
    })
    .catch(error => {  

        if (error.response.status === 400){
          notif.error(error.response.data.message)
        }

        if (error.response.status === 401){
          props.cookies.set('token', '', { path: '/' });
          resetAuthToken();
          history.push(endpoints.login); 
        }

    });
  }
 
  return (
    <div className="securitysettings-holder">

    	<div className="securitysettings-title">
    		Security Settings
    	</div>

      <div className="securitysettings-heading">
        Change account password
      </div>

      <div class="securitysettings-details-holder">
        <div class="securitysettings-label">Old Password:</div> 
        <div class="securitysettings-value"><Input.Password placeholder="Old Password" size="medium"  {...oldPassword}  /></div>
      </div>

      <div class="securitysettings-details-holder">
        <div class="securitysettings-label">New Password:</div> 
        <div class="securitysettings-value"><Input.Password placeholder="New Password" size="medium"  {...newPassword}  /></div>
      </div>

      <div class="securitysettings-details-holder">
        <div class="securitysettings-label">Re-type New Password:</div> 
        <div class="securitysettings-value"><Input.Password placeholder="Re-type New Password" size="medium"  {...newPasswordagain}  /></div>
      </div>

			<Button size="small" style={{marginTop:20 }} onClick={changePassword} type="primary">
			  Update Password 
			</Button>

    </div>
  );
}
 

 
export default SecuritySettings;
