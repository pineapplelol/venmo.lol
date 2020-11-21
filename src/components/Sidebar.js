import React, { useState } from "react";
import { Layout, Input } from "antd";
import { useHistory } from "react-router-dom";

import "../css/Sidebar.css";

const { Search } = Input;
const { Content, Sider } = Layout;

function Sidebar({ username }) {
  const history = useHistory();
  const [searchUser, setSearchUser] = useState(username);

  const onSearch = (value) => history.push(`/${value}`);

  return (
    <Sider width={"30%"} theme="light">
      <div className="sidebar-content">
        <Content>
          <h1>{username}</h1>
          <Search
            value={searchUser}
            onSearch={onSearch}
            onChange={(e) => setSearchUser(e.target.value)}
            enterButton
            width={"80%"}
          />
        </Content>
      </div>
    </Sider>
  );
}

export default Sidebar;
