import React, {useState,useLayoutEffect} from 'react';
import { Table, Tag, Space, Button } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useHistory,NavLink } from "react-router-dom";

import endpoints from "./endpoints"

import "./Dashboard.css"
import "antd/dist/antd.css";

import notif from "./notification"


import { authtoken,resetAuthToken } from './globals'

import backend from "./backend"
import axios from 'axios'

function Dashboard(props) {

	authtoken.use()

	// console.log(auth)
	// console.log("dashboard Current auth token:",props.cookies.get('token'))

	const history = useHistory();

	const createNewTest = () => {
		history.push(endpoints.newTestboard); 
	}


	// const [pageLoaded, setPageLoaded] = useState(false);
	const [testboards, setTestboards] = useState([]);

	

	useLayoutEffect(() => {	

		const fetchTestboards = () => {

		
		    axios.get(backend.listTestboards,
		    		{ 
		    			headers: {"Authorization" : props.cookies.get('token')}
		    		} 
		    	)
		        .then(response => { 
		        	
		        	setTestboards(response.data.testboards)
		        	 
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


		if (props.cookies.get('token') === "" || props.cookies.get('token') === undefined){
			history.push(endpoints.login);
		}

		fetchTestboards()	
	},[]);


	const columns = [
	  {
	    title: 'Test No.',
	    dataIndex: 'key',
	    key: 'key',
	    sorter: (a, b) => parseInt(a.key) - parseInt(b.key)
	  },
	  {
	    title: 'API Name',
	    dataIndex: 'apiName',
	    key: 'apiName',

	  },
	  {
	    title: 'Environment',
	    dataIndex: 'apiEnvironment',
	    key: 'apiEnvironment',
	    render: environment => {
	    	let color = "#38b000"
	    	if (environment === 'production') {
	            color = '#FB3640';
	        }
	        else if (environment === 'preproduction') {
	            color = '#F85E00';
	        }
	        else if (environment === 'staging') {
	            color = '#2EC0F9';
	        }
	        else if (environment === 'development') {
	            color = '#44AF69';
	        }

	        return (
	            <Tag color={color}>
	              {environment.toUpperCase()}
	            </Tag>
	          );
	    },
	    onFilter:(value, record) => record.environment.includes(value),
	    filters: [
	      {
	        text: 'DEVELOPMENT',
	        value: 'development',
	      },
	      {
	        text: 'STAGING',
	        value: 'staging',
	      },
	      {
	        text: 'PREPRODUCTION',
	        value: 'preproduction',
	      },
	      {
	        text: 'PRODUCTION',
	        value: 'production',
	      }]
	  },
	  {
	    title: 'API Type',
	    dataIndex: 'apiType',
	    key: 'apiType'
	  },
	  {
	    title: 'Created by',
	    dataIndex: 'creator',
	    key: 'creator'
	  },
	  {
	    title: 'Created on',
	    dataIndex: 'apiCreationDate',
	    key: 'apiCreationDate',
	    render: (timestamp) => timestamp.substring(0,16)
	  },
	  {
	    title: 'Last run on',
	    dataIndex: 'apiLastRunOn',
	    key: 'apiLastRunOn',
	  },
	  {
	    title: 'Action',
	    key: 'action',
	    render: (text, record) => (
	      <Space size="middle">
	        <NavLink to={endpoints.getTestboardPrefix+record.testboardID}>Open</NavLink>
	      </Space>
	    ),
	  },
	];

	return (
		<div className="dashboard-holder">

			<div className="table-holder">
				<div className="dashboard-title">
					Testing Dashboard
				</div>

				<div className="dashboard-buttons">
					<Button icon={<PlusOutlined />} size="medium" className="dashboard-button" onClick={createNewTest}>
						Create New Test
					</Button>
				</div>
				<Table className="testdash-table" pagination={{ pageSize: 20}} columns={columns} dataSource={testboards} />
			</div>
		</div>
		)

}

export default Dashboard