import React from "react";
import { Layout } from "antd";

const { Content, Sider } = Layout;

function Sidebar() {
  return (
    <Sider width={"30%"} theme="light">
      <Content>Hi</Content>
    </Sider>
  );
}

export default Sidebar;
