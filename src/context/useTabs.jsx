import { useContext } from "react";
import TabContext from "./TabContext";

const useTabs = () => {
  return useContext(TabContext);
};

export default useTabs;