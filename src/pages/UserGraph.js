import React, { useState, useEffect } from "react";
import Graph from "../components/Graph";

import { getUserGraph } from "../util/api.js";

function UserGraph(props) {
  const username = props.match.params.id;
  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const loadUserGraph = async () => {
      let allUsers = new Set([username]);
      let searched = new Set();
      let links = [];

      for (let i = 0; i < 3; i += 1) {
        let toSearch = new Set([...allUsers].filter((x) => !searched.has(x)));
        searched = allUsers;
        await searchDegree(toSearch).then((data) => {
          allUsers = new Set([...allUsers, ...data[0]]);
          links.push(...data[1]);
        });
      }

      let graph = { nodes: [], links: links };
      for (let user of allUsers) graph["nodes"].push({ name: user });
      setUserGraph(graph);
      console.log(graph);
    };

    const searchDegree = async (toSearch) => {
      let users = new Set();
      let links = [];

      for (let user of toSearch) {
        const data = await getUserGraph(user);
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

    loadUserGraph();
  }, [username]);

  return <Graph graph={userGraph} />;
}

export default UserGraph;
