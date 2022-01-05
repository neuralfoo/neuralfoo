import React, { useState,useLayoutEffect } from 'react';
import { Modal, Button, Table, Space } from 'antd';
import { BarsOutlined } from '@ant-design/icons';

import AddTestCaseModal from "./AddTestCaseModal"
import EditTestCaseModal from "./EditTestCaseModal"

import "./TestCasesModal.css"

import backend from "./backend"
import axios from 'axios'
import notif from "./notification"
import endpoints from "./endpoints"

import { authtoken,resetAuthToken } from './globals'
import { useHistory } from "react-router-dom";


function TestCasesModal(props) {

  authtoken.use()
  const history = useHistory();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setEditIsModalVisible] = useState(false);
  const [editTestcaseID, setEditTestcaseID] = useState("");
  const [editTestcaseValues, setEditTestcaseValues] = useState([]);

  const [tests, setTests] = useState([]);


  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  function deleteTestCase(testcaseID){
    
    const payload = {
      testboardID:props.testboardID,
      testcaseID:testcaseID
    };

    axios.post(backend.deleteFunctionalTestcase, payload,
      { 
        headers: {"Authorization" : props.cookies.get('token')}
      } 
    )
    .then(response => { 
      notif.success("Testcase deleted")
      
      getTestcases(props.testboardID)

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


  function editTestCase(testcaseID,record) {
    setEditTestcaseID(testcaseID)
    setEditTestcaseValues(record)
    setEditIsModalVisible(true)
  }

  function getTestcases(testboardID){

    const payload = {testboardID:props.testboardID};

    axios.post(backend.listFunctionalTestcases, payload,
      { 
        headers: {"Authorization" : props.cookies.get('token')}
      } 
    )
    .then(response => { 
      setTests(response.data.tests)
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

  var columns = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'key',
      sorter: (a, b) => parseInt(a.key) - parseInt(b.key)
    },
    {
      title: 'Testcase Name',
      dataIndex: 'testcaseName',
      key: 'testcaseName',
      width: 300
    }]

  for (var i = 0; i < props.requestCount; i++) {
    
  
    columns = columns.concat([
      {
        title: 'Request Body - Request '+(i+1).toString(),
        dataIndex: 'requestBody'+(i+1).toString(),
        key: 'requestBody'+(i+1).toString(),
        width: 400
      },
      {
        title: 'Response Code - Request '+(i+1).toString(),
        dataIndex: 'responseCode'+(i+1).toString(),
        key: 'responseCode'+(i+1).toString(),
        width: 150 
      },
      {
        title: 'Response Body - Request '+(i+1).toString(),
        dataIndex: 'responseBody'+(i+1).toString(),
        key: 'responseBody'+(i+1).toString(),
        width: 400
      },
      {
        title: 'Max Response Time - Request '+(i+1).toString(),
        dataIndex: 'responseTime'+(i+1).toString(),
        key: 'responseTime'+(i+1).toString(),
        width: 150,
        render:(text) => text.toString()+"s"
      }
    ])
  }

  var last_element = [{
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => deleteTestCase(record["testcaseID"])}>Delete</Button>
          <Button type="link" onClick={() => editTestCase(record["testcaseID"],record)}>Edit</Button>
        </Space>
      ),
    },
  ];  

  columns = columns.concat(last_element)

  useLayoutEffect(() => {
    getTestcases(props.testboardID)
  },[]);

  return (
    <>
      <Button className="functionaltable-refresh-button" onClick={showModal}>
        <BarsOutlined /> View Test Cases
      </Button>
      <Modal title="Functional Test Cases" 
        width="80%" 
        className="testcasesmodal-modal" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>,
            <AddTestCaseModal key="addTestcase" getTestcases={getTestcases} requestCount={props.requestCount} testboardID={props.testboardID} cookies={props.cookies} />
          ]}
          >
        <Table className="testcasesmodal-table" scroll={{x:true}} pagination={{ pageSize: 5}} columns={columns} dataSource={tests} />
        { isEditModalVisible ? <EditTestCaseModal 
          visible={isEditModalVisible} 
          testcaseValues={editTestcaseValues}
          sendVisibilityStatusToParent={setEditIsModalVisible}
          getTestcases={getTestcases} 
          requestCount={props.requestCount} 
          testcaseID={editTestcaseID} 
          testboardID={props.testboardID} 
          cookies={props.cookies} /> : null }

      </Modal>

    </>
  );
};

export default TestCasesModal;