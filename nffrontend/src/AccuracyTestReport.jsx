import React, {useState,useLayoutEffect} from 'react';
import { Button,Tag,Table,Modal,Space,Input } from 'antd';

import { useHistory,useParams } from "react-router-dom";

import "./AccuracyTestReport.css"
import "antd/dist/antd.css";

import { authtoken,resetAuthToken } from './globals'
import backend from "./backend"
import axios from 'axios'

import notif from "./notification"
import endpoints from "./endpoints"


function AccuracyTestReport(props) {

	authtoken.use()

	let { testboardID,testID } = useParams();

	const [test, setTestDetails] = useState({});
	const [hits, setHits] = useState([]);
	
	const history = useHistory();
	
	const { TextArea } = Input;

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [requestOutput, setRequestOutput] = useState("");

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleOk = () => {
		setIsModalVisible(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const updateModelData = (response) => {
		var s = JSON.stringify(response,undefined, 2)
		// console.log(s)
		setRequestOutput(s)
		showModal()
	}

	const getTestDetails = () => {
		let payload = {
			testID : testID,
			testboardID:testboardID
		}
		axios.post(backend.getImgClfAccuracyReport,payload,
		{ 
			headers: {"Authorization" : props.cookies.get('token')}
		})
		.then(function (response) {
			// console.log(response.data.test)
			setTestDetails(response.data.test)
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


	const getApiHits = () => {
		let payload = {
			testID : testID,
			testboardID:testboardID
		}
		axios.post(backend.listApiHits,payload,
		{ 
			headers: {"Authorization" : props.cookies.get('token')}
		})
		.then(function (response) {
			// console.log(response.data.hits)
			setHits(response.data.hits)
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

	useLayoutEffect(() => {
		getTestDetails()
		getApiHits()
	}, []);

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	const columns = [
	  {
	    title: '#',
	    dataIndex: 'key',
	    key: 'key',
	    sorter: (a, b) => parseInt(a.key) - parseInt(b.key)
	  },
	  {
	    title: 'Filename',
	    dataIndex: 'filename',
	    key: 'filename',
	  },
	  {
	    title: 'Confidence',
	    dataIndex: 'confidence',
	    key: 'confidence',
	  },
	  {
	    title: 'Ground Truth',
	    dataIndex: 'groundTruth',
	    key: 'groundTruth'
	  },
	  {
	    title: 'Prediction',
	    dataIndex: 'prediction',
	    key: 'prediction'
	  },
	  {
	    title: 'Total Response Time',
	    dataIndex: 'totalResponseTime',
	    key: 'totalResponseTime'
	  },
	  {
	    title: 'Result',
	    dataIndex: 'result',
	    key: 'result',
	    filters: [
	      {
	        text: 'PASS',
	        value: true,
	      },
	      {
	        text: 'FAIL',
	        value: false,
	      }
	    ],
	    onFilter:(value, record) => record.result == value,
	    render: status => {
	    	let color = ""
	    	let value = ""
	    	if (status === true) {
	            color = 'green';
	            value = 'PASS'
	        }
	        else if (status === false) {
	            color = 'red';
	            value = "FAIL"
	        }
	        return (
	            <Tag color={color} key={status}>
	              {value}
	            </Tag>
	          );
	    }
	  },
	  {
	    title: 'Action',
	    key: 'action',
	    render: (text, record) => (
	      <Space size="middle">
	        <a target="_blank" rel="noreferrer" href={backend.host+record.imageUrl}>Show Image</a>
	        <Button type="link" onClick={() => updateModelData(record.response)}>API response</Button>
	      </Space>
	    ),
	  },
	];


	function statusTag(status) {
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
    }

    function envTag(environment) {
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
	    }


	return (
		<div className="accuracytestreport-holder">

			{test.testboard ?
				<div className="accuracytestreport-content">
					
					<div className="accuracytestreport-title">
						Accuracy Report
					</div>

					<div className="accuracytestreport-testboard-details">

						<div className="accuracytestreport-sub-title">
							Testboard Details
						</div>

						<div className="accuracytestreport-key-value">
							<div className="accuracytestreport-key" >
								Testboard Name:
							</div>
							<div className="accuracytestreport-value">
								<a  className="accuracytestreport-link" target="_blank" rel="noreferrer" href={endpoints.host+endpoints.getTestboardPrefix+testboardID}>
									{test.testboard.apiName}
								</a>
							</div>
						</div>

						<div className="accuracytestreport-key-value">
							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Testboard Type:
								</div>
								<div className="accuracytestreport-value">
									{test.testboard.apiTypeName}
								</div>
							</div>

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Testboard Environment:
								</div>
								<div className="accuracytestreport-value">
									{envTag(test.testboard.apiEnvironment)}
								</div>
							</div>
						</div>

						<div className="accuracytestreport-sub-title">
							Test Details
						</div>

						<div className="accuracytestreport-key-value">

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Test start time:
								</div>
								<div className="accuracytestreport-value">
									{test.startTime}
								</div>
							</div>

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Test end time:
								</div>
								<div className="accuracytestreport-value">
									{test.endTime}
								</div>
							</div>

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Test run duration:
								</div>
								<div className="accuracytestreport-value">
									{test.duration}
								</div>
							</div>

						</div>

						<div className="accuracytestreport-key-value">

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Number of test images:
								</div>
								<div className="accuracytestreport-value">
									{test.testImagesCount}
								</div>
							</div>

							<div className="accuracytestreport-key-value">
								<div className="accuracytestreport-key" >
									Test status:
								</div>
								<div className="accuracytestreport-value">
									{statusTag(test.testStatus)}
								</div>
							</div>
						</div>

						<div className="accuracytestreport-sub-title">
							API Request Template
						</div>

						{
							test.testboard.requests.map(
								(item,index) => (
									<div key={index}>	
										<div className="accuracytestreport-small-title">
											{"Request "+(index+1).toString()}
										</div>
										<div className="accuracytestreport-key-value">
											<div className="accuracytestreport-key-value">
												<div className="accuracytestreport-key" >
													HTTP Method:
												</div>
												<div className="accuracytestreport-value">
													{item.apiHttpMethod}
												</div>
											</div>

											<div className="accuracytestreport-key-value">
												<div className="accuracytestreport-key" >
													Endpoint:
												</div>
												<div className="accuracytestreport-value">
													{item.apiEndpoint}
												</div>
											</div>
										</div>
										<div className="accuracytestreport-key-value">
											<div className="accuracytestreport-key" >
												HTTP Headers:
											</div>
											<div className="accuracytestreport-value">
												{item.apiHeader.map((item,index) => {
													return (
														<div key={index}>
															<br/>
															{item[0] + " : " + item[1]}
														</div>
														)
												})}
											</div>
										</div>
										<div className="accuracytestreport-key-value">
											<div className="accuracytestreport-key-value">
												<div className="accuracytestreport-key" >
													API Input Type:
												</div>
												<div className="accuracytestreport-value">
													{item.apiInputDataType}
												</div>
											</div>

											<div className="accuracytestreport-key-value">
												<div className="accuracytestreport-key" >
													Request Body Type:
												</div>
												<div className="accuracytestreport-value">
													{item.apiRequestBodyType}
												</div>
											</div>

											<div className="accuracytestreport-key-value">
												<div className="accuracytestreport-key" >
													Response Body Type:
												</div>
												<div className="accuracytestreport-value">
													{item.apiResponseBodyType}
												</div>
											</div>
										</div>
										<div className="accuracytestreport-key-value">
											<div className="accuracytestreport-key" >
												Request Body:
											</div>
											<div className="accuracytestreport-value">
												{item.apiRequestBody}
											</div>
										</div>
										<div className="accuracytestreport-key-value">
											<div className="accuracytestreport-key" >
												Response Body:
											</div>
											<div className="accuracytestreport-value">
												{item.apiResponseBody}
											</div>
										</div>
										<br/>
									</div>

							))	
						}

						<div className="accuracytestreport-sub-title">
							Test Metrics
						</div>
						<div className="accuracytestreport-key-value">
							<div className="accuracytestreport-key" >
								Accuracy:
							</div>
							<div className="accuracytestreport-value">
								{test.accuracy ? test.accuracy.toString()+"%" : "<calculated after test is completed>"}
							</div>
						</div>

						<div className="accuracytestreport-key-value">
							<div className="accuracytestreport-key" >
								Confusion Matrix:
							</div>
							<div className="accuracytestreport-value">
								{test.confusionMatrix ? 
									<table>
										<tbody>
											{test.confusionMatrix.map((row, i) => (
											  <tr key={i}>
											    {row.map((col, j) => (
											      <td className="accuracytestreport-table-cell" key={j}>{col}</td>
											    ))}
											  </tr>
											))}
										</tbody>
									</table>
								: "<calculated after test is completed>"}

								
							</div>
						</div>
						
						<div className="accuracytestreport-sub-title">
							API Hits
						</div>

					    <Table className="accuracytestreport-table" columns={columns} dataSource={hits} />

					    <Modal width={800} title="API Response" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
							<TextArea rows={20} value={requestOutput} /> 
						</Modal>

					</div>

				</div>
			: null }

		</div>
	)

}

export default AccuracyTestReport

