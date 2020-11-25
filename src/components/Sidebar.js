import React, { useState, useEffect, useLayoutEffect } from "react";
import { Button, Collapse, Layout, Input, List } from "antd";
import { useHistory } from "react-router-dom";

import { getUserInformation } from "../util/api.js";
import "../css/Sidebar.css";

const { Panel } = Collapse;
const { Search } = Input;
const { Content, Sider, Footer } = Layout;

const ListItem = List.Item;
const ListItemMeta = List.Item.Meta;

function Sidebar({ username, userDegrees, transactions }) {
  const history = useHistory();
  const users = Object.keys(userDegrees);
  const [searchUser, setSearchUser] = useState(username);
  const [userInfo, setUserInfo] = useState({});
  const portrait = window.innerHeight > window.innerWidth;
  const [width, height] = useWindowSize();

  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
  }
  const directToUser = (value) => history.push(`/${value}`);

  useEffect(() => {
    const getUserInfo = async () => {
      await getUserInformation(username).then((data) => {
        setUserInfo(data);
      });
    };

    getUserInfo();
  }, [username]);

  return (
    <Sider
      width={portrait ? "80%" : "30%"}
      theme="light"
      collapsible={portrait}
      collapsedWidth={0}
    >
      <Layout style={{ height: `${height}px` }}>
        <Content>
          <div className="sidebar-content">
            <h1>{`${userInfo.name} (${username})`}</h1>
            <Search
              value={searchUser}
              onSearch={directToUser}
              onChange={(e) => setSearchUser(e.target.value)}
              enterButton
              width={"80%"}
            />
            <div className="sidebar-information">
              <Collapse accordion>
                <Panel header="User Information" key="user-info">
                  <div className="user-info">
                    <div className="user-info-text">
                      <h1>{userInfo.name}</h1>
                      <p>{userInfo.venmoSince}</p>
                    </div>
                    <img src={userInfo.img} alt="profile" />
                  </div>
                </Panel>
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
                <Panel
                  header="Transactions"
                  key="transactions"
                  extra={transactions.length}
                >
                  <List
                    dataSource={transactions}
                    renderItem={(t) => (
                      <ListItem>
                        <ListItemMeta
                          title={
                            <div className="user-list-row">
                              {t.transactionType === "charged"
                                ? `${t.recipient} charged ${t.sender}`
                                : `${t.sender} paid ${t.recipient}`}
                              <div className="user-list-row-description">
                                {t.date}
                              </div>
                            </div>
                          }
                          description={t.message}
                        />
                      </ListItem>
                    )}
                  />
                </Panel>
              </Collapse>
            </div>
          </div>
        </Content>
        <Footer className="sidebar-footer">
          <a href="https://pineapple.lol">
            <img src="/images/pineapplelol.png" alt="pineapplelol" />
          </a>
          <div className="vercel">
            <a href="https://vercel.com?utm_source=pineapplelol&utm_campaign=oss">
              <img src="/powered-by-vercel.svg" alt="vercel" />
            </a>
          </div>
        </Footer>
      </Layout>
    </Sider>
  );
}

export default Sidebar;
