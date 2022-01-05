import React,{useLayoutEffect} from 'react';
import { Tabs } from 'antd';

import endpoints from "./endpoints"

import "./Settings.css"
import "antd/dist/antd.css";

import GeneralSettings from "./GeneralSettings"
import SecuritySettings from "./SecuritySettings"
import OrganizationSettings from "./OrganizationSettings"

import { useHistory } from "react-router-dom";


const { TabPane } = Tabs;

function Settings(props) {

	const history = useHistory();

	useLayoutEffect(() => {
		if (props.cookies.get('token') === "" || props.cookies.get('token') === undefined){
		  history.push(endpoints.login);
		}
	})

	return (
		<div className="settings-holder">

			<div className="settings-table-holder">
				<div className="settings-title">
					Settings
				</div>
				
				<Tabs tabPosition="left">
		          <TabPane tab="General" key="1">
		            <GeneralSettings cookies={props.cookies} />
		          </TabPane>
		          <TabPane tab="Security" key="2">
		            <SecuritySettings cookies={props.cookies} />
		          </TabPane>
		          <TabPane tab="Organization" key="3">
		            <OrganizationSettings cookies={props.cookies} />
		          </TabPane>
		          <TabPane tab="Plans" key="4">
		            Content of Tab 4
		          </TabPane>
		          <TabPane tab="Billing" key="5">
		            Content of Tab 5
		          </TabPane>
		        </Tabs>
				
			</div>
		</div>
		);

}

export default Settings