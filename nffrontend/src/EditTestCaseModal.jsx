import React, { useState,useEffect,useLayoutEffect } from 'react';
import { Modal, Button, Table, Space, Input } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import CodeEditor from '@uiw/react-textarea-code-editor';

import backend from "./backend"
import axios from 'axios'
import notif from "./notification"
import endpoints from "./endpoints"

import { authtoken,resetAuthToken } from './globals'
import { useHistory } from "react-router-dom";

import "./EditTestCaseModal.css"

function EditTestCaseModal(props) {


  authtoken.use()
  const history = useHistory();

  const [isModalVisible, setIsModalVisible] = useState(props.visible);
  
  // const [isEditingMode, setIsEditingMode] = useState(false);

  const [testcaseName, setTestcaseName] = useState("");

  // initialise a nested array of #requests X {request object}
  const [testcaseValues, setTestcaseValues] = useState(
    new Array(props.requestCount).fill("").map(
      () => ({
              requestBody:"",
              responseBody:"",
              responseTime:"",
              responseCode:""
            })
    )
  );
  

  const showModal = () => {
    // setIsModalVisible(true);
    props.sendVisibilityStatusToParent(true)
  };

  const handleOk = () => {
    // setIsModalVisible(false);
    // setIsEditingMode(false)
    props.sendVisibilityStatusToParent(false)
  };

  const handleCancel = () => {
    // setIsModalVisible(false);
    // setIsEditingMode(false)
    props.sendVisibilityStatusToParent(false)
  };

  function editTestCase(){
    const payload = {
      testboardID:props.testboardID,
      testcaseName:testcaseName,
      testcaseID:props.testcaseID,
      testcaseValues:testcaseValues};

    if (!payload.testcaseName){
      notif.error("Testcase name cannot be empty")
      return
    }

    for (let i=0; i < props.requestCount; i++){
      if (!payload.testcaseValues[i]["responseCode"]){
        notif.error("Response code cannot be empty")
        return
      }

      if (!payload.testcaseValues[i]["responseTime"]){
        notif.error("Response time cannot be empty")
        return
      }

      if (!payload.testcaseValues[i]["requestBody"]){
        notif.error("Response code cannot be empty")
        return
      } 
    }


    axios.post(backend.editFunctionalTestcase, payload,
      { 
        headers: {"Authorization" : props.cookies.get('token')}
      } 
    )
    .then(response => { 
      props.getTestcases(props.testboardID)
      notif.success("Testcase saved!")
      // setIsModalVisible(false);
      props.sendVisibilityStatusToParent(false)
    })
    .catch(error => {
        
        if (error.response !== undefined){
          if (error.response.status === 400){
            notif.error(error.response.data.message)
          }

          if (error.response.status === 401){
            props.cookies.set('token', '', { path: '/' });
            resetAuthToken();
            history.push(endpoints.login);
          }
      }
    });
  }

  function onChangeRequestValue(e,key,value){
    let newArr = JSON.parse(JSON.stringify(testcaseValues));
    // console.log(e.target.getAttribute("requestindex")  ,key)
    newArr[parseInt(e.target.getAttribute("requestindex"))][key] = value
    // console.log(newArr)
    setTestcaseValues(newArr)
  }

  var forms = []



  for (var i = 0; i < props.requestCount; i++) {

    var element = (<div >
      <div className="addtestcasemodal-key-value-holder">
        <div className="addtestcasemodal-keyname">
          Response Status Code - Request {(i+1).toString()}
        </div>
        <div className="addtestcasemodal-valuename">
          <Input 
            placeholder="Type your response code here ..." 
            size="large" className="addtestcasemodal-input" 
            type="number"
            requestindex={i}
            value={testcaseValues[i]["responseCode"]} 
            onChange = {(e) => onChangeRequestValue(e,"responseCode",e.target.value)} bordered={true} />
        </div>
      </div>

      <div className="addtestcasemodal-key-value-holder">
        <div className="addtestcasemodal-keyname">
          Max Response Time (seconds) - Request {(i+1).toString()}
        </div>
        <div className="addtestcasemodal-valuename">
          <Input 
            placeholder="Type your max response time in seconds ..." 
            size="large" className="addtestcasemodal-input" 
            type="number"
            requestindex={i}
            value={testcaseValues[i]["responseTime"]} 
            onChange = {(e) => onChangeRequestValue(e,"responseTime",e.target.value)} bordered={true} />
        </div>
      </div>

      <div className="addtestcasemodal-key-value-holder">
        <div className="addtestcasemodal-keyname">
          Request Body - Request {(i+1).toString()}
        </div>
        <div className="addtestcasemodal-valuename">
          <CodeEditor
            requestindex={i}
            value={testcaseValues[i]["requestBody"]} 
            onChange = {(e) => onChangeRequestValue(e,"requestBody",e.target.value)}

            language="json"
            placeholder="Type request body here ..."
            padding={15}
            className="addtestcasemodal-requestbody"
            style={{fontSize: 14,fontFamily:"monospace"}}
          />
        </div>
      </div>
      <div className="addtestcasemodal-key-value-holder">
        <div className="addtestcasemodal-keyname">
          Response Body - Request {(i+1).toString()}
        </div>
        <div className="addtestcasemodal-valuename">
          <CodeEditor
            
            requestindex={i}
            value={testcaseValues[i]["responseBody"]} 
            onChange = {(e) => onChangeRequestValue(e,"responseBody",e.target.value)}

            language="json"
            placeholder="Type response body here ..."
            padding={15}
            className="addtestcasemodal-requestbody"
            style={{fontSize: 14,fontFamily:"monospace"}}
          />
        </div>
      </div>
    </div>)

    forms.push(element)
  }

  function fillValues(values){
    setTestcaseName(values["testcaseName"])

    var temp = new Array(props.requestCount).fill("").map(
        () => ({
                requestBody:"",
                responseBody:"",
                responseTime:"",
                responseCode:""
              })
      )

    for (var i = 0; i < props.requestCount; i++) {
      temp[i]["requestBody"]  = values['requestBody'+(i+1).toString()]
      temp[i]["responseBody"] = values['responseBody'+(i+1).toString()]
      temp[i]["responseTime"] = values['responseTime'+(i+1).toString()] 
      temp[i]["responseCode"] = values['responseCode'+(i+1).toString()] 
    }

    setTestcaseValues(temp)

  }

  useLayoutEffect(() => {
    // if (isEditingMode == false){
      // setIsModalVisible()
      fillValues(props.testcaseValues)  
      // setIsEditingMode(true)
    // }
  },[]);


  return (
    <>
      <Modal title="Edit test case" 
        width="50%" 
        className="edittestcasemodal-modal" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>,
            <Button key="submit" type="primary" onClick={editTestCase}>
              Save testcase
            </Button>
          ]}
          >
          <div className="edittestcasemodal-key-value-holder" key="-1">
            <div className="edittestcasemodal-keyname">
              Testcase name
            </div>
            <div className="edittestcasemodal-valuename">
              <Input 
                placeholder="Type your testcase name here ..." 
                size="large" className="edittestcasemodal-input" 
                value={testcaseName} 
                onChange = {(e) => setTestcaseName(e.target.value)} bordered={true} />
            </div>
          </div>
          {
            forms.map( (item,index) => <div key={index} > {item} </div> )
          }
          

      </Modal>
    </>
  );
};

export default EditTestCaseModal;


