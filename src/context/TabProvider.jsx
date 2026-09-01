import { useState } from "react";
import TabContext from "./TabContext";

const TabProvider = ({ children }) => {
  
  const [tabs, setTabs] = useState([
    {
      id: "dashboard",
      title: "داشبورد",
      path: "/dashboard",
      pageType: "dashboard",
      closable: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState("dashboard");

  // باز کردن تب
  const openTab = ({ title, path, pageType, closable = true, data = {} }) => {

    const tabId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const newTab = {
      id: tabId,
      title,
      path,
      pageType,
      closable,
      data,
    };

    setTabs((prevTabs) => [
      ...prevTabs,
      newTab,
    ]);

    setActiveTabId(tabId);

    return newTab;
  };
  // فعال کردن تب
  const activateTab = (id) => {
    setActiveTabId(id);
  };

  // بستن تب
  const closeTab = (id) => {
    setTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex(
        (tab) => tab.id === id
      );

      const newTabs = prevTabs.filter(
        (tab) => tab.id !== id
      );

      if (id === activeTabId) {
        const nextTab =
          newTabs[tabIndex - 1] ||
          newTabs[tabIndex] ||
          newTabs[0];

        if (nextTab) {
          setActiveTabId(nextTab.id);
        }
      }

      return newTabs;
    });
  };

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        activateTab,
        closeTab,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export default TabProvider;