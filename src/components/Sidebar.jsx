// @flow
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { Button, Collapse, Layout, Input, List, notification } from 'antd';
import { useHistory } from 'react-router-dom';

import { getUserInformation } from '../util/api';
import type { Transaction } from '../types';
import '../css/Sidebar.css';

const { Panel } = Collapse;
const { Search } = Input;
const { Content, Sider, Footer } = Layout;

const ListItem = List.Item;
const ListItemMeta = List.Item.Meta;

const defaultUserInfo = {
  username: '',
  name: '',
  dateJoined: '',
  profilePictureURL: '',
};

type Props = {
  username: string,
  userDegrees: Array<[string, number]>,
  transactions: Array<Transaction>,
};

function Sidebar(props: Props): Node {
  const { username, userDegrees, transactions } = props;

  const history = useHistory();
  const [searchUser, setSearchUser] = useState(username);
  const [userInfo, setUserInfo] = useState(defaultUserInfo);
  const [userExists, setUserExists] = useState(true);
  const portrait = window.innerHeight > window.innerWidth;

  const directToUser = (value) => history.push(`/${value}`);

  useEffect(() => {
    const openPrivateNotification = () => {
      notification.warning({
        message: `${username} is private!`,
        description: 'User payment network is not available.',
        duration: 0,
      });
    };

    const openUserExistNotification = () => {
      notification.error({
        message: `${username} doesn't exist!`,
        description: 'User payment network is not available.',
        duration: 0,
      });
    };

    const getUserInfo = async () => {
      await getUserInformation(username).then((data) => {
        if (!data) {
          notification.destroy();
          setUserExists(false);
          setUserInfo(defaultUserInfo);
          openUserExistNotification();
        } else {
          notification.destroy();
          setUserExists(true);
          setUserInfo(data);
          if (data.isPrivate) openPrivateNotification();
        }
      });
    };

    getUserInfo();
  }, [username]);

  return (
    <Sider
      width={portrait ? '80%' : '30%'}
      theme="light"
      collapsible={portrait}
      collapsedWidth={0}
    >
      <Layout>
        <Content>
          <div className="sidebar-content">
            <h1>{`${userInfo.name} (${username})`}</h1>
            <Search
              value={searchUser}
              onSearch={directToUser}
              onChange={(e) => setSearchUser(e.target.value)}
              enterButton
              width="80%"
            />
            <div className="sidebar-information">
              <Collapse accordion collapsible={!userExists && 'disabled'}>
                <Panel header="User Information" key="user-info">
                  <div className="user-info">
                    <div className="user-info-text">
                      <h1>{userInfo.name}</h1>
                      <p>Joined Venmo in {userInfo.dateJoined}</p>
                    </div>
                    <img src={userInfo.profilePictureURL} alt="profile" />
                  </div>
                </Panel>
                <Panel
                  header="Users in Graph"
                  key="users"
                  extra={userDegrees.length}
                >
                  <List
                    dataSource={userDegrees}
                    renderItem={(user) => (
                      <Button
                        className="user-list-card"
                        onClick={() => {
                          directToUser(user[0]);
                        }}
                        block
                      >
                        <ListItem>
                          <ListItemMeta
                            title={
                              <div className="user-list-row">
                                {user[0]}
                                <div>Depth: {user[1]}</div>
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
                  extra={transactions.length !== 0 ? transactions.length : ''}
                >
                  <List
                    dataSource={transactions}
                    renderItem={(t) => (
                      <ListItem>
                        <ListItemMeta
                          title={
                            <div className="user-list-row">
                              {`${t.actor.name} ${t.action} ${t.target.name}`}
                              <div className="user-list-row-description">
                                {t.date}
                              </div>
                            </div>
                          }
                          description={t.note}
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
