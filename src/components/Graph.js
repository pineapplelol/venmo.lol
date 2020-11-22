import React, { useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import { useHistory } from "react-router-dom";

function Graph({ graph }) {
  const history = useHistory();
  const [cursor, setCursor] = useState("default");

  return (
    <div style={{ cursor: cursor }}>
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
        onNodeClick={(value) => {
          history.push(`/${value.name}`);
        }}
        nodeLabel={""}
        onNodeHover={(node) =>
          node ? setCursor("pointer") : setCursor("default")
        }
      />
    </div>
  );
}

export default Graph;
