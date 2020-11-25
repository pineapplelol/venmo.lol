import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import Graph from "../components/Graph";
import Sidebar from "../components/Sidebar";

import { getUserTransactions } from "../util/api.js";
import "../css/UserGraph.css";

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
      let searched = new Set();
      let toSearch = new Set([username]);
      let userDegrees = {};

      let seenLinks = new Set();
      let links = [];

      let seenTransactions = new Set();
      let transactions = [];

      for (let i = 0; i < 3; i += 1) {
        if (i !== 0) {
          toSearch = new Set([...allUsers].filter((x) => !searched.has(x)));
          for (let u of toSearch) {
            if (!(u in userDegrees)) userDegrees[u] = i;
          }
          setUserDegrees(userDegrees);
        }

        await searchDegree(toSearch).then((data) => {
          allUsers = new Set([...allUsers, ...data[0]]);

          let users = [];
          for (let user of allUsers) users.push({ name: user });

          for (let l of data[1]) {
            const k = `${l.to}${l.from}`;
            if (!seenLinks.has(k)) {
              seenLinks.add(k);
              links.push(l);
            }
          }
          setUserGraph({ nodes: users, links: [] });
          // https://github.com/vasturiano/react-force-graph/issues/238
          // setUserGraph({ nodes: users, links: [...links] });

          for (let t of data[2]) {
            const k = `${t.sender}${t.date}`;
            if (!seenTransactions.has(k)) {
              seenTransactions.add(k);
              transactions.push(t);
            }
          }
          setTransactions(transactions);
        });
      }

      for (let u of allUsers) {
        if (!(u in userDegrees)) userDegrees[u] = 3;
      }
      setUserDegrees(userDegrees);

      let realUsername = matchUsername(allUsers);
      userDegrees[realUsername] = 0;
      setDisplayUsername(realUsername);

      let users = [];
      for (let user of allUsers) users.push({ name: user });
      setUserGraph({ nodes: users, links: links });
    };

    const matchUsername = (allUsers) => {
      for (let u of allUsers) {
        if (u.toLowerCase() === username.toLowerCase()) return u;
      }
    };

    const searchDegree = async (toSearch) => {
      let users = new Set();
      let links = [];
      let transactions = [];

      for (let user of toSearch) {
        const data = await getUserTransactions(user);
        if (data) {
          for (let t of data) {
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
        username={displayUsername}
        userDegrees={userDegrees}
        transactions={transactions}
      />
      <Content>
        <div className="graph">
          <Graph graph={userGraph} />
        </div>
      </Content>
    </Layout>
  );
}

export default UserGraph;
