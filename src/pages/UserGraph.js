import React, { useState, useEffect } from "react";
import { Layout } from "antd";

import Graph from "../components/Graph";
import Sidebar from "../components/Sidebar";

import { getUserTransactions } from "../util/api.js";
import "../css/UserGraph.css";

const { Content } = Layout;

function UserGraph(props) {
  const [username, setUsername] = useState(props.match.params.id);
  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });
  const [degrees, setDegrees] = useState({});

  useEffect(() => {
    const generateUserGraph = async () => {
      let allUsers = new Set();
      let searched = new Set();
      let toSearch = new Set([username]);
      let degrees = {};
      degrees[username] = 0;
      let links = [];

      for (let i = 0; i < 3; i += 1) {
        if (i !== 0) {
          toSearch = new Set([...allUsers].filter((x) => !searched.has(x)));
          for (let u of toSearch) {
            if (!(u in degrees)) degrees[u] = i;
          }
        }
        searched = allUsers;
        await searchDegree(toSearch).then((data) => {
          allUsers = new Set([...allUsers, ...data[0]]);
          links.push(...data[1]);
        });
      }

      for (let u of allUsers) {
        if (!(u in degrees)) degrees[u] = 3;
      }

      matchUsername(allUsers);
      setDegrees(degrees);

      let graph = { nodes: [], links: links };
      for (let user of allUsers) graph["nodes"].push({ name: user });
      setUserGraph(graph);
    };

    const matchUsername = (allUsers) => {
      for (let u of allUsers) {
        if (u.toLowerCase() === username.toLowerCase()) setUsername(u);
      }
    };

    const searchDegree = async (toSearch) => {
      let users = new Set();
      let links = [];

      for (let user of toSearch) {
        const data = await getUserTransactions(user);
        if (data) {
          for (let t of data) {
            users.add(t.sender);
            users.add(t.recipient);
            links.push({ from: t.sender, to: t.recipient });
          }
        }
      }
      return [users, links];
    };

    generateUserGraph();
  }, [username]);

  return (
    <Layout>
      <Sidebar
        username={username}
        users={userGraph["nodes"]}
        degrees={degrees}
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
