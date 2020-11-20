import React, { useState, useEffect } from "react";
import Graph from "../components/Graph";

import { getUserGraph } from "../util/api.js";

function UserGraph(props) {
  const username = props.match.params.id;
  const [userGraph, setUserGraph] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const loadUserGraph = async () => {
      const data = await getUserGraph(username);

      if (data) {
        let graph = { nodes: [], links: [] };
        let userSet = new Set();

        for (let t of data) {
          userSet.add(t.sender);
          userSet.add(t.recipient);
          graph["links"].push({ from: t.sender, to: t.recipient });
        }

        for (let item of userSet) graph["nodes"].push({ name: item });
        console.log(graph);
        setUserGraph(graph);
      }
    };

    loadUserGraph();
  }, [username]);

  return (
    <>
      <Graph graph={userGraph} />
    </>
  );
}

export default UserGraph;
