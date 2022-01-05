import React, { useState,useLayoutEffect } from 'react';
import './OrganizationSettings.css';
import { useHistory } from "react-router-dom";

// import Button from '@material-ui/core/Button';

import { Button,Typography } from 'antd';




import backend from "./backend"
import axios from 'axios'

import notif from "./notification"

import endpoints from "./endpoints"

import { authtoken,resetAuthToken } from './globals'


function OrganizationSettings(props) {

  authtoken.use()
  const { Text, Link } = Typography;

  // const [onboardingLink, setOnboardingLink] = useState('');
  const [organization, setOrganization] = useState('');


  

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

  const onboardingLink = useFormInput('');
  // const lastName = useFormInput('');
  
  const history = useHistory();



  const getReferralCode = () => {

    axios.get(backend.getReferralCode,
          { 
            headers: {"Authorization" : props.cookies.get('token')}
          })
        .then(response => { 
          onboardingLink.onChange(endpoints.onboardMemberPrefix+response.data.referralCode)
          setOrganization(response.data.organization)

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


  useLayoutEffect(() => {
    getReferralCode()
  },[])

  const refreshReferralCode = () => {

    axios.get(backend.refreshReferralCode,
    { 
        headers: {"Authorization" : props.cookies.get('token')}
      })
    .then(response => {
      onboardingLink.onChange(endpoints.onboardMemberPrefix+response.data.referralCode)

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
    <div className="organizationsettings-holder">

    	<div className="organizationsettings-title">
    		Organization Settings
    	</div>

      <div class="organizationsettings-details-holder">
        <div class="organizationsettings-label">Organization name:</div> 
        <div class="organizationsettings-value">{organization}</div>
      </div>

      <div class="organizationsettings-details-holder">
        <div class="organizationsettings-label">Onboarding link:</div> 
        <Link target="_blank" href={onboardingLink.value} copyable>{onboardingLink.value}</Link>
      </div>

      <Text italic={true}>If you would like to add a new person to your organization, please share the above onboarding link with the new user.</Text>
      <br/>
      <Text type="danger">Note:</Text>
      <Text type="danger">Please share your onboarding link only with someone who you would like to add to your organization.</Text>
      <Text type="danger">You can generate a new onboarding link, in case your existing link is leaked to a third party who does not belong to your organization.</Text>

      {/*
        Add members table
        each row will have member account email and role, action to remove account/change role
      */}
			
      <Button size="small" style={{marginTop:20 }} onClick={refreshReferralCode} type="default">
			  Generate new onboarding link 
			</Button>


    </div>
  );
}
 

 
export default OrganizationSettings;
