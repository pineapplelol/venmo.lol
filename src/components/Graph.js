import React from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";

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
      nodeThreeObject={(node) => {
        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        sprite.textHeight = 4;
        sprite.position.y = -8;
        return sprite;
      }}
      nodeThreeObjectExtend={true}
      nodeRelSize={3}
      nodeLabel={""}
    />
  );
}

export default Graph;
