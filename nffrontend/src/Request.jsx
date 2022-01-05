import React, {useState,useLayoutEffect} from 'react';
import { Input,Select,Button,Radio,Divider } from 'antd';

import { PlusOutlined, MinusSquareOutlined } from '@ant-design/icons';
// import { useHistory,useParams } from "react-router-dom";

import "./Request.css"
import "antd/dist/antd.css";

import { authtoken } from './globals'
// import backend from "./backend"
// import axios from 'axios'

import CodeEditor from '@uiw/react-textarea-code-editor';


function Request(props) {

	authtoken.use()


	const [apiHttpMethod, setApiHttpMethod] = useState(props.data.apiHttpMethod);
	const [apiEndpoint, setApiEndpoint] = useState(props.data.apiEndpoint);
	const [apiHeader, setApiHeader] = useState(props.data.apiHeader);
	const [apiInputDataType, setApiInputDataType] = useState(props.apiInputDataType);
	const [apiRequestBodyType, setApiRequestBodyType] = useState(props.apiRequestBodyType);
	const [apiResponseBodyType, setApiResponseBodyType] = useState(props.apiResponseBodyType);
	const [apiRequestBody, setApiRequestBody] = useState(props.apiRequestBody);
	const [apiResponseBody, setApiResponseBody] = useState(props.apiResponseBody);


	const onChangeApiEndpoint = (e) => {
		props.onChange(props.index,"apiEndpoint",e.target.value) 
		setApiEndpoint(e.target.value)
		props.setTestboardEdited(true)
	}

	const onChangeApiHttpMethod = (e) => {
		props.onChange(props.index,"apiHttpMethod",e) 
		setApiHttpMethod(e)
		props.setTestboardEdited(true)
	}

	useLayoutEffect(() => {
		setApiEndpoint(props.data.apiEndpoint)
		setApiHeader(props.data.apiHeader)
		setApiHttpMethod(props.data.apiHttpMethod)
		setApiInputDataType(props.data.apiInputDataType)
		setApiRequestBodyType(props.data.apiRequestBodyType)
		setApiResponseBodyType(props.data.apiResponseBodyType)
		setApiRequestBody(props.data.apiRequestBody)
		setApiResponseBody(props.data.apiResponseBody)
	},[]);

	const onChangeApiInputDataType = (e) => {
		props.onChange(props.index,"apiInputDataType",e.target.value) 
		setApiInputDataType(e.target.value)
		props.setTestboardEdited(true)
	}

	const onChangeApiRequestBodyType = (e) => {
		props.onChange(props.index,"apiRequestBodyType",e.target.value) 
		setApiRequestBodyType(e.target.value)
		props.setTestboardEdited(true)
	}


	const onChangeApiResponseBodyType = (e) => {
		props.onChange(props.index,"apiResponseBodyType",e.target.value) 
		setApiResponseBodyType(e.target.value)
		props.setTestboardEdited(true)
	}

	const onChangeApiRequestBody = (e) => {
		props.onChange(props.index,"apiRequestBody",e.target.value) 
		setApiRequestBody(e.target.value)
		props.setTestboardEdited(true)
	}


	const onChangeApiResponseBody = (e) => {
		props.onChange(props.index,"apiResponseBody",e.target.value) 
		setApiResponseBody(e.target.value)
		props.setTestboardEdited(true)
	}


	const onHeaderNameChange = e => {

	    const { target: {value, name } } = e

	    let newArr = [...apiHeader]
	    newArr[parseInt(name)][0] = value

	    setApiHeader(newArr)
		props.onChange(props.index,"apiHeader",newArr) 
	    props.setTestboardEdited(true)

	}

	const onHeaderValueChange = e => {
	    const { target: {value, name } } = e

	    let newArr = [...apiHeader]
	    newArr[parseInt(name)][1] = value
	    
	    setApiHeader(newArr)
	    props.onChange(props.index,"apiHeader",newArr) 
	    props.setTestboardEdited(true)
	}
	 
	const addHeader = () => {
		let newArr = [...apiHeader,["",""]]
		setApiHeader(newArr)
	  	props.onChange(props.index,"apiHeader",newArr) 
	    props.setTestboardEdited(true)
	}

	const removeHeader = e => {

	    let newArr = [...apiHeader]
	    newArr.splice(parseInt(e),1)
	    setApiHeader(newArr)

	    props.onChange(props.index,"apiHeader",newArr) 
	    props.setTestboardEdited(true)

	}


	const { Option } = Select;


	return (
			<div className="request-holder">

				<Divider orientation="left" style={{borderTopColor:"#AAA"}} >
					<div className="request-title-horizontal-holder">
						<div className="request-title">
								Request {props.index+1}
						</div>
						<div className="request-icon-holder"> 
							<MinusSquareOutlined onClick={() => props.removeRequest(props.index)} /> 
						</div> 
					</div>
				</Divider>

				<div className="request-horizontal-holder">
					<div className="request-key-value-holder">
						<div className="request-keyname">
							HTTP Method
						</div>
						<div className="request-valuename">
							<Select 
								placeholder="Method" size="medium" 
								className="request-input-httpmethod"  
								value={apiHttpMethod} 
								onChange = {onChangeApiHttpMethod} >

								<Option value="GET">GET</Option>
								<Option value="POST">POST</Option>
								<Option value="PUT">PUT</Option>
								<Option value="DELETE">DELETE</Option>
							</Select>
						</div>
					</div>


					<div className="request-key-value-holder-fullwidth">
						<div className="request-keyname">
							API Endpoint
						</div>
						<div className="request-valuename-endpoint">
							<Input 
								placeholder="Type your API endpoint here ..." 
								size="large" className="request-input-endpoint" 
								value={apiEndpoint} 
								onChange = {onChangeApiEndpoint}
								bordered={false} />
						</div>
					</div>

				</div>
				

				<div className="request-keyname">
					HTTP Headers
				</div>

				{
					apiHeader.map((item,index) => (
						<div className="request-horizontal-holder" key={index}>
                        	<div className="request-key-value-holder">
								<div className="request-valuename">
									<Input 
										placeholder="key" 
										size="large" className="request-input-header" 
										bordered={true} name={index} value={item[0]} onChange={onHeaderNameChange}/>
								</div>
							</div>

							<div className="request-key-value-holder">
								<div className="request-valuename">
									<Input 
										placeholder="value" 
										size="large" className="request-input-header" 
										bordered={true} name={index} value={item[1]} onChange={onHeaderValueChange}/>
								</div>
							</div>

							<div className="request-icon-holder"> <MinusSquareOutlined name={index} onClick={() => removeHeader(index)} /> </div> 
						</div>
                	)) 
				}

				<Button className="add-header-button" type="dashed" 
						icon={<PlusOutlined />} size="small" onClick={addHeader}>
					Add Header
				</Button>

				<div className="request-key-value-holder">
					<div className="request-keyname">
						API Input Type
					</div>
					<Radio.Group className="request-requestbodytype"
						value={apiInputDataType} 
						onChange = {onChangeApiInputDataType} >

					  <Radio value="url" className="request-radio-button-text">URL</Radio>
					  <Radio value="file" className="request-radio-button-text">File</Radio>
					  <Radio value="base64" className="request-radio-button-text">Base64</Radio>
					  <Radio value="none" className="request-radio-button-text">None</Radio>
					</Radio.Group>
				</div>

				<div className="request-horizontal-holder">

					<div className="request-key-value-holder">
						<div className="request-keyname">
							API Request Body Template
						</div>
						
						<Radio.Group className="request-requestbodytype" 
							value = {apiRequestBodyType} 
							onChange = {onChangeApiRequestBodyType} 
							>
						  <Radio value="json" className="request-radio-button-text" >JSON</Radio>
						  <Radio value="formData" className="request-radio-button-text">Form-Data</Radio>
						  <Radio value="binary" className="request-radio-button-text">Binary</Radio>
						  <Radio value="none" className="request-radio-button-text">None</Radio>
						</Radio.Group>

						<CodeEditor
							value={apiRequestBody} 
							onChange = {onChangeApiRequestBody} 
							
							language="json"
							placeholder="Type request body template here ..."
							padding={15}
							className="request-requestbody"
							style={{fontSize: 14,fontFamily:"monospace"}}
						/>
					</div>


					<div className="request-key-value-holder">
						<div className="request-keyname">
							API Response Body Template
						</div>
						<Radio.Group className="request-requestbodytype" 

							value={apiResponseBodyType} 
							onChange = {onChangeApiResponseBodyType}
							>
						  <Radio value="json" className="request-radio-button-text">JSON</Radio>
						  <Radio value="rawText" className="request-radio-button-text">Raw Text</Radio>
						</Radio.Group>
						<CodeEditor
							value={apiResponseBody} 
							onChange = {onChangeApiResponseBody}
							
							language="json"
							placeholder="Type response body template here ..."

							padding={15}
							className="request-requestbody"
							style={{fontSize: 14,fontFamily:"monospace"}}
							
						/>
					</div>

				</div>
			</div>
			
	)

}

export default Request

