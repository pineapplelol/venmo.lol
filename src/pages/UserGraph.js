import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';

import Graph from '../components/Graph';
import Sidebar from '../components/Sidebar';
import { getUserTransactions } from '../util/api.js';
import '../css/UserGraph.css';

const { Content } = Layout;

function UserGraph(props) {
  const username = props.match.params.id;

  const [displayUsername, setDisplayUsername] = useState(username);
  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });
  const [userDegrees, setUserDegrees] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const generateUserGraph = async () => {
      let allUsers = new Set();
      const searched = new Set();
      let toSearch = new Set([username]);
      const userDegrees = {};

      const seenLinks = new Set();
      const links = [];

      const seenTransactions = new Set();
      const transactions = [];

      for (let i = 0; i < 3; i += 1) {
        if (i !== 0) {
          toSearch = new Set([...allUsers].filter(x => !searched.has(x)));
          for (const u of toSearch) if (!(u in userDegrees)) userDegrees[u] = i;
          setUserDegrees(userDegrees);
        }

        const realUsername = matchUsername(allUsers);
        if (realUsername && realUsername !== displayUsername)
          setDisplayUsername(realUsername);

        await searchDegree(toSearch).then(data => {
          allUsers = new Set([...allUsers, ...data[0]]);

          const users = [];
          for (const user of allUsers) users.push({ name: user });

          for (const l of data[1]) {
            const k = `${l.to}${l.from}`;
            if (!seenLinks.has(k)) {
              seenLinks.add(k);
              links.push(l);
            }
          }
          setUserGraph({ nodes: users, links: [] });
          // https://github.com/vasturiano/react-force-graph/issues/238
          // setUserGraph({ nodes: users, links: [...links] });

          for (const t of data[2]) {
            const k = `${t.sender}${t.date}`;
            if (!seenTransactions.has(k)) {
              seenTransactions.add(k);
              transactions.push(t);
            }
          }
          setTransactions(transactions);
        });
      }

      for (const u of allUsers) if (!(u in userDegrees)) userDegrees[u] = 3;
      setUserDegrees(userDegrees);

      userDegrees[username] = 0;

      const users = [];
      for (const user of allUsers) users.push({ name: user });

      if (users.length === 0)
        setUserGraph({ nodes: [{ name: username }], links: [] });
      else setUserGraph({ nodes: users, links });
    };

    const matchUsername = allUsers => {
      if (allUsers.size === 0) return username;
      for (const u of allUsers) {
        if (u.toLowerCase() === username.toLowerCase()) return u;
      }
      return username;
    };

    const searchDegree = async toSearch => {
      const users = new Set();
      const links = [];
      const transactions = [];

      for (const user of toSearch) {
        const data = await getUserTransactions(user);
        if (data) {
          for (const t of data) {
            users.add(t.sender);
            users.add(t.recipient);
            links.push({
              from: t.sender,
              to: t.recipient,
              name: `${t.sender} to ${t.recipient}: ${t.message}`,
            });
            transactions.push(t);
          }
        }
      }

      return [users, links, transactions];
    };

    generateUserGraph();
  }, [username]);

  return (
    <Layout>
      <Sidebar
        username={username}
        userDegrees={userDegrees}
        transactions={transactions}
      />
      <Content className="graph">
        <Graph graph={userGraph} />
      </Content>
    </Layout>
  );
}

export default UserGraph;
