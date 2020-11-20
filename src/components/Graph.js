import React from "react";
import { ForceGraph3D } from "react-force-graph";

function Graph({ graph }) {
  return (
    <ForceGraph3D
      graphData={graph}
      nodeId="name"
      linkSource="from"
      linkTarget="to"
      backgroundColor="#000000"
      enableNodeDrag={false}
      nodeAutoColorBy="name"
      linkAutoColorBy="from"
      linkWidth={1.5}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={1}
    />
  );
}

export default Graph;
