import React, { useState } from "react";
import { Button, Collapse, Layout, Input, List } from "antd";
import { useHistory } from "react-router-dom";

import "../css/Sidebar.css";

const { Panel } = Collapse;
const { Search } = Input;
const { Content, Sider } = Layout;

const ListItem = List.Item;
const ListItemMeta = List.Item.Meta;

function Sidebar({ username, userDegrees }) {
  const history = useHistory();
  const users = Object.keys(userDegrees);
  const [searchUser, setSearchUser] = useState(username);

  const directToUser = (value) => history.push(`/${value}`);

  return (
    <Sider width={"30%"} theme="light">
      <div className="sidebar-content">
        <Content>
          <h1>{username}</h1>
          <Search
            value={searchUser}
            onSearch={directToUser}
            onChange={(e) => setSearchUser(e.target.value)}
            enterButton
            width={"80%"}
          />
          <div className="sidebar-information">
            <Collapse accordion>
              <Panel header="Users in Graph" key="users" extra={users.length}>
                <List
                  dataSource={users}
                  renderItem={(user) => (
                    <Button
                      className="user-list-card"
                      onClick={() => {
                        directToUser(user);
                      }}
                      block
                    >
                      <ListItem>
                        <ListItemMeta
                          title={
                            <div className="user-list-row">
                              {user}
                              <div>Depth: {userDegrees[user]}</div>
                            </div>
                          }
                        />
                      </ListItem>
                    </Button>
                  )}
                />
              </Panel>
            </Collapse>
          </div>
        </Content>
      </div>
    </Sider>
  );
}

export default Sidebar;
