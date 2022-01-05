import React, {useState,useEffect} from 'react';
import { Select, Divider, Input,Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import notif from "./notification"

import { useHistory } from "react-router-dom";

import backend from "./backend"
import axios from 'axios'
import endpoints from "./endpoints"

import { resetAuthToken } from './globals'


const { Option } = Select;


function SelectClass (props){


  const history = useHistory();

  const [name,setName] = useState("")
  const [items,setItems] = useState(props.classNamesList)
  const [selectedClass,setSelectedClass] = useState(props.selectedClass)


  const onNameChange = event => {
    setName(event.target.value);
  };

  const addItem = () => {

    if (name === ""){
      notif.error("Class name cannot be empty")
      return
    }

    if (items.includes(name)) {
      return
    }

    setItems(items => ([...items, name]))    
    props.addClass(name)
    setName('')
  };

  const updateClassForImage = (imageID,className) => {
    
    const payload = {
      testboardID:props.testboardID,
      imageID:props.imageID,
      annotation:className
    };

    axios.post(backend.updateAnnotation, payload,
      { 
        headers: {"Authorization" : props.cookies.get('token')}
      } 
    )
      .then(response => {
        setSelectedClass(className)
        props.updateClass(props.index,className)
        notif.success("Class change saved!")

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

  const changeClass = (e) => {

    updateClassForImage(props.imageID,e)
  }

  useEffect( ()=>{
    setItems(props.classNamesList)
    setSelectedClass(props.selectedClass)
  })
  
  return (
    <Select
      style={{ width: 200 }}
      placeholder="Select class"
      value={selectedClass}
      onChange={(e) => changeClass(e)}
      dropdownRender={menu => (
        <div>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
            <Input style={{ flex: 'auto' }} value={name} onChange={onNameChange} />
            <Button type="link"
              style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
              onClick={addItem}
            >
              <PlusOutlined /> Add class
            </Button>
          </div>
        </div>
      )}
    >
      {items.map(item => (
        <Option key={item}>{item}</Option>
      ))}
    </Select>
  );
}

export default SelectClass