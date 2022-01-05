import React, {useState,useLayoutEffect} from 'react';
import { Table,Space,Button,Tag } from 'antd';

import { ReloadOutlined,BarsOutlined } from '@ant-design/icons';

import { useHistory } from "react-router-dom";

import "./FunctionalTable.css"
import "antd/dist/antd.css";

import { authtoken,resetAuthToken } from './globals'
import backend from "./backend"
import axios from 'axios'
import notif from "./notification"
import TestCasesModal from "./TestCasesModal"

import endpoints from "./endpoints"




function FunctionalTable(props) {

	authtoken.use()
	const history = useHistory();
	const [tests, setTests] = useState([]);


	const getFunctionalTests = () => {
		
		let payload = {
			testboardID:props.testboardID
		}

		axios.post(backend.functionalTestList,payload,
				{ 
	    			headers: {"Authorization" : props.cookies.get('token')}
	    		})
		.then(function (response) {
			// console.log(response.data.tests)
			setTests(response.data.tests)
		})
		.catch(function (error) {
		
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
	            if (error.response.status === 403){
	            	notif.error("Access denied");
	            }
	        }

		})
	
	}

	const runAccuracyTest = () => {

		let payload = {
			testboardID:props.testboardID,
			action:"start",
			testID:""
		}

		axios.post(backend.functionalTestAction, payload,
    		{ 
    			headers: {"Authorization" : props.cookies.get('token')}
    		} 
    	)
        .then(response => { 
        	// history.push(endpoints.getTestboardPrefix+response.data.id);
        	notif.success(response.data.message)
        	getFunctionalTests()
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

	const deleteTest = (testID) => {
		let payload = {
			testID:testID,
			testboardID:props.testboardID
		}

		axios.post(backend.deleteTest, payload,
    		{ 
    			headers: {"Authorization" : props.cookies.get('token')}
    		} 
    	)
        .then(response => { 
        	// history.push(endpoints.getTestboardPrefix+response.data.id);
        	notif.success(response.data.message)
        	getFunctionalTests()
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

	useLayoutEffect(()=>{
		getFunctionalTests()
	},[])


	const columns = [
	  {
	    title: '#',
	    dataIndex: 'key',
	    key: 'key',
	    sorter: (a, b) => parseInt(a.key) - parseInt(b.key)
	  },
	  {
	    title: 'Start time',
	    dataIndex: 'startTime',
	    key: 'startTime',
	  },
	  {
	    title: 'Duration',
	    dataIndex: 'duration',
	    key: 'duration',
	  },
	  {
	    title: '# Test Cases',
	    dataIndex: 'totalCasesCount',
	    key: 'totalCasesCount'
	  },
	  {
	    title: 'Pass/Fail cases',
	    key: 'passfail',
	    render:(text,record) => {
	    	return record.passedCasesCount.toString()+"/"+record.failedCasesCount.toString()
	    }
	  },
	  {
	    title: 'Status',
	    dataIndex: 'testStatus',
	    key: 'testStatus',
	    filters: [
	      {
	        text: 'STOPPED',
	        value: 'stopped',
	      },
	      {
	        text: 'RUNNING',
	        value: 'running',
	      },
	      {
	        text: 'COMPLETED',
	        value: 'completed',
	      },
	      {
	        text: 'READY',
	        value: 'ready',
	      }
	    ],
	    onFilter:(value, record) => record.status.includes(value),
	    render: status => {
	    	let color = "blue"
	    	if (status === 'running') {
	            color = 'green';
	        }
	        else if (status === 'completed') {
	            color = 'gold';
	        }
	        else if (status === 'stopped') {
	            color = 'red';
	        }
	        else if (status === 'ready') {
	            color = 'blue';
	        }
	        
	        return (
	            <Tag color={color} key={status}>
	              {status.toUpperCase()}
	            </Tag>
	          );
	    },
	  },
	  {
	    title: 'Action',
	    key: 'action',
	    render: (text, record) => (
	      <Space size="middle">
	        <a target="_blank" href={endpoints.functionalReportPrefix+props.testboardID+"/"+record["testID"]}>Open Report</a>
	        <Button type="link" onClick={() => deleteTest(record["testID"])}>Delete Test</Button>
	      </Space>
	    ),
	  },
	];

	return (
		<div className="functionaltable-holder">
			<div className="functionaltable-horizontal-holder">
				<div className="functionaltable-title">
					Functional Tests
				</div>
				<div className="functionaltable-upload-holder">
				    <TestCasesModal  testboardID={props.testboardID} requestCount={props.requestCount} cookies={props.cookies} />
				    <Button className="functionaltable-refresh-button" onClick={getFunctionalTests}>
				    	<ReloadOutlined /> Refresh Test List
				    </Button>
					<Button type="primary" className="functionaltable-refresh-button" onClick={runAccuracyTest}>
				    	Run New Test
				    </Button>
				</div>
			</div>
		    <Table className="functionaltable-table" columns={columns} dataSource={tests} />
		</div>
	)
}

export default FunctionalTable;

