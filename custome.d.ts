declare module "*.svg" {
  import React = require("react");
  import { SvgProps } from "react-native-svg";
  export const ReactComponent: React.FunctionComponent<SvgProps & { fill?: string }>;
  export default content;
}
