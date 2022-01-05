import React, {useState,useLayoutEffect} from 'react';
import { Input,Select,Button,Radio } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useHistory,useParams } from "react-router-dom";

import "./Testboard.css"
import "antd/dist/antd.css";

import { authtoken,resetAuthToken } from './globals'
import backend from "./backend"
import axios from 'axios'

import TestFilesTable from "./TestFilesTable"
import AccuracyTable from "./AccuracyTable"
import FunctionalTable from "./FunctionalTable"

import notif from "./notification"

import endpoints from "./endpoints"

import Request from "./Request"

function Testboard(props) {

	authtoken.use()



	let { testboardID } = useParams();

	const [testboard, setTestboard] = useState({});
	const [testboardReceived, setTestboardReceived] = useState(false);
	const [testboardEdited, setTestboardEdited] = useState(false);
	
	// const [executeOnce, setExecuteOnce] = useState(false);


	const history = useHistory();

	const [apiName, setApiName] = useState("");
	const [apiVisibility, setApiVisibility] = useState(null);
	const [apiRequests, setApiRequests] = useState([]);

	
	const newRequest = () => {

		var r = {}
		r.apiEndpoint = ""
		r.apiHeader = []
		r.apiInputDataType = null
		r.apiRequestBodyType = null
		r.apiResponseBodyType = null
		r.apiResponseBody = ""
		r.apiRequestBody = ""
		r.apiHttpMethod = null
		setApiRequests([...apiRequests,r])
		setTestboardEdited(true)
	}

	const removeRequest = (i) => {
	    let newArr = [...apiRequests]
	    newArr.splice(parseInt(i),1)

	    setApiRequests(newArr)
		setTestboardEdited(true)
	}


	const changeRequestParam = (i,p,v) => {
		var r = [...apiRequests]
		r[i][p] = v
		setApiRequests(r)

	}

	const initValues = (response) => {

		setTestboard(response.data.testboard);
		setApiName(response.data.testboard.apiName);
		setApiVisibility(response.data.testboard.visibility)
		setApiRequests(response.data.testboard.apiRequests);
	}

	const getTestboard = () => {
		if (testboardID !== undefined && testboardReceived === false){

			axios.get(backend.getTestboard+testboardID,{ 
		    			headers: {"Authorization" : props.cookies.get('token')}
		    		})
			.then(function (response) {
				
				setTestboardReceived(true)
				initValues(response)
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
		        }

			})
		}
	}

	useLayoutEffect(() => {
		// console.log(props.cookies.get('token'))
		// setAuthToken(props.cookies.get('token'))

		if (props.cookies.get('token') === "" || props.cookies.get('token') === undefined){
			history.push(endpoints.login);
		}

		if (testboardID === undefined){
			newRequest()			
		}
		else{
			getTestboard()
		}
	}, []);


	const onChangeApiName = (e) => {
		onFieldChange(e,"apiName") 
		setApiName(e.target.value)
		setTestboardEdited(true)
	}

	const onChangeApiVisibility = (e) => {
		onFieldChange(e,"visibility") 
		setApiVisibility(e.target.value)
		setTestboardEdited(true)
	}


	const onFieldChange = (e,f) => {


	    let temp = testboard

		if (typeof e == "string"){
			temp[f] = e
		}
		else{
		    temp[f] = e.target.value
		}

	    setTestboard(temp)
		setTestboardEdited(true)
	}


	const createTestboard = () => {
	  	
	  	const payload = testboard;
	  	payload.apiRequests = apiRequests

	  	if (!payload.apiName){
	  		notif.error("Testboard name cannot be empty")
	  		return
	  	}

	  	if (!payload.apiType){
	  		notif.error("Testboard type cannot be empty")
	  		return
	  	}

	  	if (!payload.apiEnvironment){
	  		notif.error("Testboard environment cannot be empty")
	  		return
	  	}

	  	if (payload.apiVisibility !== null && payload.apiVisibility !== undefined){
	  		notif.error("Please choose testboard visibility")
	  		return
	  	}

	  	for (let i=0; i < payload.apiRequests.length; i++){
	  		if (!payload.apiRequests[i]["apiHttpMethod"]){
	  			notif.error("Please choose HTTP Method")
		  		return
	  		}
	  		if (!payload.apiRequests[i]["apiEndpoint"]){
	  			notif.error("API Endpoint cannot be empty")
		  		return
	  		}
	  		if (payload.apiType == "generalapi"){
		  		if (!payload.apiRequests[i]["apiResponseBody"]){
		  			notif.error("API Response cannot be empty")
			  		return
		  		}
		  		if (!payload.apiRequests[i]["apiInputDataType"]){
		  			notif.error("Please choose API input data type")
			  		return
		  		}
		  		if (!payload.apiRequests[i]["apiRequestBodyType"]){
		  			notif.error("Please choose API request body type")
			  		return
		  		}
		  		if (!payload.apiRequests[i]["apiResponseBodyType"]){
		  			notif.error("Please choose response body type")
			  		return
		  		}	
	  		}
	  		
	  	}

	    axios.post(backend.createTestboard, payload,
	    		{ 
	    			headers: {"Authorization" : props.cookies.get('token')}
	    		} 
	    	)
	        .then(response => { 
	        	history.push(endpoints.getTestboardPrefix+response.data.id);
	        	notif.success("Testboard created!")
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

  	const updateTestboard = () => {
	  	
	  	const payload = testboard;

	  	payload.apiRequests = apiRequests

	    axios.post(backend.updateTestboard, payload,
	    		{ 
	    			headers: {"Authorization" : props.cookies.get('token')}
	    		} 
	    	)
	        .then(response => { 
	        	setTestboardEdited(false) 
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

  	const discardTestboard = () => {
  		history.push(endpoints.dashboard); 
  	}




	const { Option } = Select;


	return (
		<div className="testboard-holder">

			<div className="testboard-container">

				<div className="testboard-title">
					{apiName} Testboard
				</div>

				<div className="testboard-key-value-holder">
					<div className="testboard-keyname">
						Testboard name
					</div>
					<div className="testboard-valuename">
						<Input 
							placeholder="Type your testboard name here ..." 
							size="large" className="testboard-input" 
							value={apiName} 
							onChange = {onChangeApiName} bordered={true} />
					</div>
				</div>

					

				<div className="testboard-horizontal-holder">
					<div className="testboard-key-value-holder">
						<div className="testboard-keyname">
							Testboard type
						</div>
						<div className="testboard-valuename">
							<Select 
								placeholder="What does it do?" size="medium" 
								className="testboard-select" 
								value={testboard ? testboard.apiType : "" } 
								onChange = {(evn) => onFieldChange(evn,"apiType")} 
								disabled = {testboardReceived} >

								<Option value="imageclassification">Image Classification</Option>
								<Option value="generalapi">General API</Option>
								{/*<Option value="objectdetection">Object Detection</Option>*/}
							</Select>
						</div>
					</div>

					<div className="testboard-key-value-holder">
						<div className="testboard-keyname">
							Testboard environment
						</div>
						<div className="testboard-valuename">
							<Select 
								placeholder="Where is it hosted?" size="medium" 
								className="testboard-select"  
								value={testboard ? testboard.apiEnvironment : "" } 
								onChange = {(evn) => onFieldChange(evn,"apiEnvironment")} >

								<Option value="development">Development</Option>
								<Option value="staging">Staging</Option>
								<Option value="preproduction">Preproduction</Option>
								<Option value="production">Production</Option>
							</Select>
						</div>
					</div>
				</div>

				<div className="testboard-key-value-holder">
					<div className="testboard-keyname">
						Testboard visibility
					</div>
					<div className="testboard-valuename">
						<Radio.Group className="testboard-radio" 
						value={apiVisibility} 
						onChange = {onChangeApiVisibility} 
						>
								<Radio value="public" className="testboard-radio-button-text" >
									<b>Public</b> (anyone in your organisation can view and edit this testboard)
								</Radio>
								<Radio value="private" className="testboard-radio-button-text">
									<b>Private</b> (only you can view and edit this testboard)
								</Radio>
						</Radio.Group>
					</div>
				</div>


				{
					
					apiRequests.map((item,index) => (
							<Request key={index} index={index} data={item} removeRequest={removeRequest} onChange={changeRequestParam} setTestboardEdited={setTestboardEdited} />
					))

				}
				
				<Button className="add-request-button" 
						icon={<PlusOutlined />} size="medium" onClick={newRequest}>
					Add Request
				</Button>



				{
					testboardID ?
				
					<div className="testboard-horizontal-holder testboard-button-holder">
						<Button type="primary" 
								className="create-testboard-button" 
								onClick={updateTestboard} 
								disabled={testboardEdited ? false : true} >
								Save Changes
						</Button>
					</div>	

				:			
					<div className="testboard-horizontal-holder testboard-button-holder">
						<Button type="primary" 
								className="create-testboard-button" 
								onClick={createTestboard} >
								Create Testboard
						</Button>
						<Button className="discard-testboard-button" onClick={discardTestboard} >Discard</Button>
					</div>

				}

				{
					testboardID && testboard.apiType === "imageclassification" 
					?
					<div className="testboard-vertical-holder">
						<TestFilesTable testboardID={testboardID} cookies={props.cookies} />
						<AccuracyTable testboardID={testboardID} cookies={props.cookies} />
						<FunctionalTable testboardID={testboardID} requestCount={apiRequests.length} cookies={props.cookies} />
					</div>
					:
					null
				}
				{
					testboardID && testboard.apiType === "generalapi" 
					?
					<div className="testboard-vertical-holder">
						<FunctionalTable testboardID={testboardID} requestCount={apiRequests.length} cookies={props.cookies} />
					</div>
					:
					null
				}


			</div>

		</div>
	)

}

export default Testboard

