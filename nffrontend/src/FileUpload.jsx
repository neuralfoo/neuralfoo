import {useState} from 'react';
import { Upload, message, Button, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import backend from "./backend"

message.config({
  duration: 2,
  maxCount: 1
});

function FileUpload(props){

	const [gt,setGt] = useState("");

	const uploadprops = {
	  name: 'file',
	  action: backend.uploadImageFile,
	  headers: {
	  	Authorization : props.cookies.get('token')
	  },
	  multiple:true,
	  data:{testboardID : props.testboardID, groundTruth:gt},
	  onChange(info) {
	    if (info.file.status !== 'uploading') {
	      // console.log(info.file, info.fileList);
	    }
	    if (info.file.status === 'done') {
	      // message.success(`${info.file.name} file uploaded successfully`);
	    } else if (info.file.status === 'error') {
	      message.error(`${info.file.name} file upload failed.`);
	    }
	  },
	};


	const onChangeGt = (e) => {
		setGt(e.target.value)
	}

	return (
		<>
		<Input placeholder="Default Groud truth" value={gt} onChange={onChangeGt} />
	  <Upload {...uploadprops}>
	    <Button icon={<UploadOutlined />}>Click to Upload</Button>
	  </Upload>
	  </>
	);

}

export default FileUpload;