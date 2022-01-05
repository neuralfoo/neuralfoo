import React, { useState,useLayoutEffect } from 'react';
import './GeneralSettings.css';
import { useHistory } from "react-router-dom";

// import Button from '@material-ui/core/Button';

import { Input,Button } from 'antd';

import backend from "./backend"
import axios from 'axios'

import notif from "./notification"

import endpoints from "./endpoints"

import { authtoken,resetAuthToken } from './globals'


function GeneralSettings(props) {

  authtoken.use()

  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [signUpDate, setSignUpDate] = useState('');

  const [detailsChanged,setDetailsChanged] = useState(false)
  

  const useFormInput = initialValue => {
    const [value, setValue] = useState(initialValue);
   
    const handleChange = e => {
      if (typeof e == "string"){
        setValue(e);
      }
      else{
        setValue(e.target.value);  
      }
      setDetailsChanged(true)
    }
    return {
      value,
      onChange: handleChange
    }
  }

  const firstName = useFormInput('');
  const lastName = useFormInput('');
  const history = useHistory();



  const fetchUserDetails = () => {


    axios.get(backend.fetchUserDetails,
          { 
            headers: {"Authorization" : props.cookies.get('token')}
          })
        .then(response => { 
          lastName.onChange(response.data.lastName)
          firstName.onChange(response.data.firstName)
          setEmail(response.data.email)
          setSignUpDate(response.data.signupDate)
          setOrganization(response.data.organization)
          setDetailsChanged(false)
        })
        .catch(error => {  

            if (error.response !== undefined){
              if (error.response.status === 400){
                notif.error(error.response.data.message)
              }

              if (error.response.status === 401){
                // notif.error(error.response.data.message);
                props.cookies.set('token', '', { path: '/' });
                resetAuthToken();
                history.push(endpoints.login); 
              }
            }
        });
  }


  useLayoutEffect(() => {
    fetchUserDetails()
    

  },[])

  const saveUserDetails = () => {
    const payload = {firstName:firstName.value,lastName:lastName.value}
    axios.post(backend.updateUserDetails,payload,
    { 
        headers: {"Authorization" : props.cookies.get('token')}
      })
    .then(response => { 
      setDetailsChanged(false)
    })
    .catch(error => {  

        if (error.response.status === 400){
          notif.error(error.response.data.message)
        }

        if (error.response.status === 401){
          // notif.error(error.response.data.message);
          props.cookies.set('token', '', { path: '/' });
          resetAuthToken();
          history.push(endpoints.login); 
        }

    });
  }
 
  return (
    <div className="generalsettings-holder">

    	<div className="generalsettings-title">
    		General Settings
    	</div>
      
			<div class="generalsettings-horizontal-holder">
        <div class="generalsettings-input-holder">
        <div class="generalsettings-label">First Name</div> <Input placeholder="First Name" size="medium"  {...firstName}  />
        </div>
        <div class="generalsettings-input-holder">
        <div class="generalsettings-label">Last Name</div> <Input placeholder="Last Name" size="medium"  {...lastName}  />
        </div>
      </div>

      <div class="generalsettings-details-holder">
        <div class="generalsettings-label">Registered email ID:</div> 
        <div class="generalsettings-value">{email}</div>
      </div>

      <div class="generalsettings-details-holder">
        <div class="generalsettings-label">Organization:</div> 
        <div class="generalsettings-value">{organization}</div>
      </div>

      <div class="generalsettings-details-holder" >
        <div class="generalsettings-label">Signup date:</div> 
        <div class="generalsettings-value"> {signUpDate}</div>
      </div>
			<Button size="small" style={{marginTop:20 }} onClick={saveUserDetails} type="primary" disabled={!detailsChanged}>
			  Save Changes 
			</Button>

    </div>
  );
}
 

 
export default GeneralSettings;
