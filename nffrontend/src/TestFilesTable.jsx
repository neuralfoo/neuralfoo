import React, {useState,useLayoutEffect} from 'react';
import { Table,Space,Modal, Button } from 'antd';

import { useHistory } from "react-router-dom";

import "./TestFilesTable.css"
import "antd/dist/antd.css";

import { authtoken,resetAuthToken } from './globals'
import backend from "./backend"
import axios from 'axios'
import notif from "./notification"

import endpoints from "./endpoints"

import FileUpload from "./FileUpload"
import SelectClass from "./SelectClass"

function TestFilesTable(props) {

	authtoken.use()

	const history = useHistory();

	const [files, setFiles] = useState([]);

	const [isModalVisible, setIsModalVisible] = useState(false);

	const [classNamesList,setClassNamesList] = useState([])

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleOk = () => {
		getTestImagesForTestboard()
		setIsModalVisible(false);	
	};

	const handleCancel = () => {
		getTestImagesForTestboard()
		setIsModalVisible(false);
	};

	function generateClassNamesList(data){
		
		var temp = [];

		for (let i = 0; i < data.length; i++) {
			if (data[i]["className"] == null){
				continue
			}
			// console.log(temp,data[i]["className"],temp.includes(data[i]["className"]))
			if (!temp.includes(data[i]["className"])) {
				temp.push(data[i]["className"])
			}
		}


		setClassNamesList(temp)
		setFiles(data)
		// console.log(classNamesList)
		// console.log(data)
	}

	function addClass(className){
		var t = [...classNamesList]
		t.push(className)
		setClassNamesList(t)
		// console.log(classNamesList)
	}

	function updateClass(i,className){
		
		var t = [...files]

		t[i]["className"] = className
		t[i]["annotation"] = className

		setFiles(t)
		
	}

	const getTestImagesForTestboard = () => {
  	
	  	const payload = {testboardID:props.testboardID};

	    axios.post(backend.getTestFiles, payload,
    		{ 
    			headers: {"Authorization" : props.cookies.get('token')}
    		} 
    	)
        .then(response => { 
        	// console.log(response.data.files)
        	generateClassNamesList(response.data.files)
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


	function deleteImage(imageID) {
		const payload = {testboardID:props.testboardID,imageIDs:[imageID]};

	    axios.post(backend.deleteTestFiles, payload,
    		{ 
    			headers: {"Authorization" : props.cookies.get('token')}
    		} 
    	)
        .then(response => {
        	var deleted = response.data.deleteCount.toString()
        	var total = response.data.originalCount.toString()

        	notif.success("Deleted "+deleted+" out of "+total+" file(s)")
        	getTestImagesForTestboard()
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
		getTestImagesForTestboard()
	},[]);


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
	    title: 'File Size',
	    dataIndex: 'fileSize',
	    key: 'fileSize',
	  },
	  {
	    title: 'Image Resolution',
	    dataIndex: 'imageResolution',
	    key: 'imageResolution'
	  },
	  {
	    title: 'Filetype',
	    dataIndex: 'fileType',
	    key: 'fileType'
	  },
	  {
	    title: 'Ground Truth',
	    dataIndex: 'className',
	    key: 'className',
	    render: (className,record) => (
	    	<SelectClass cookies={props.cookies} updateClass={updateClass} index={record["key"]-1} testboardID={props.testboardID} selectedClass={className} imageID={record["imageID"]} classNamesList={classNamesList} addClass={addClass} />
	    	)
	  },
	  {
	    title: 'Action',
	    key: 'action',
	    render: (text, record) => (
	      <Space size="middle">
	        <a target="_blank" rel="noreferrer" href={backend.getImageFile+record["imageID"]+"/"+record["filename"]}>Preview</a>
	        <Button type="link" onClick={() => deleteImage(record["imageID"])}>Delete</Button>
	      </Space>
	    ),
	  },
	];


	return (
			
		<div className="inputtable-holder">
			<div className="inputtable-horizontal-holder">
				<div className="inputtable-title">
					Test files
				</div>

				<div className="inputtable-upload-holder">
					<Button type="default" onClick={showModal}>
				    	Upload Test Files
				    </Button>
				</div>
			</div>
			<Modal title="Upload test images" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
				<FileUpload cookies={props.cookies} testboardID={props.testboardID} />
		    </Modal>
		    <Table className="inputtable-table" columns={columns} dataSource={files} />
		</div>
	)

}

export default TestFilesTable

