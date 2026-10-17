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

  //  اضافه شد: نگهداری آیدی تبی که تغییرات ذخیره‌نشده دارد
const [pendingCloseTabId, setPendingCloseTabId] = useState(null);
const [showCloseAllModal, setShowCloseAllModal] = useState(false);
const [tabClosingQueue, setTabClosingQueue] = useState([]);

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

  //  برای اینکه بقیه تب های دارای تغییرات رو هم چک کنه و پیغام بده بسته شه یا نه
  const processNextInQueue = (currentQueue, currentTabs) => {
    if (currentQueue.length === 0) {
      setTabClosingQueue([]);
      setPendingCloseTabId(null);
      return;
    }

    const nextId = currentQueue[0];
    const remainingQueue = currentQueue.slice(1);
    const targetTab = currentTabs.find((t) => t.id === nextId);

    if (targetTab && targetTab.isDirty) {
      setActiveTabId(targetTab.id);
      setPendingCloseTabId(targetTab.id);
      setTabClosingQueue(remainingQueue);
    } else if (targetTab) {
      executeCloseTab(nextId, remainingQueue);
    } else {
      processNextInQueue(remainingQueue, currentTabs);
    }
  };
//
  const executeCloseTab = (id, queueOverride = null) => {
    setTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === id);
      const newTabs = prevTabs.filter((tab) => tab.id !== id);

      if (id === activeTabId) {
        const nextTab = newTabs[tabIndex - 1] || newTabs[tabIndex] || newTabs[0];
        if (nextTab) {
          setActiveTabId(nextTab.id);
        }
      }

      const currentQueue = queueOverride !== null ? queueOverride : tabClosingQueue;

      if (currentQueue.length > 0) {
        setTimeout(() => {
          processNextInQueue(currentQueue, newTabs);
        }, 50);
      } else {
        setTabClosingQueue([]);
        setPendingCloseTabId(null);
      }

      return newTabs;
    });
  };


// بستن تب (با چک کردن تغییرات ذخیره‌نشده)
// بستن تب
const closeTab = (id, force = false) => {
    const targetTab = tabs.find((tab) => tab.id === id);

    if (targetTab && targetTab.isDirty && !force) {
      setPendingCloseTabId(id);
      return;
    }

    executeCloseTab(id);
  };

//  اضافه شد: تابع بستن همه تب‌ها
  const closeAllTabs = () => {
    const closableTabs = tabs.filter((t) => t.closable);
    if (closableTabs.length === 0) return;

    const tabIds = closableTabs.map((t) => t.id);
    const firstTab = closableTabs[0];

    if (firstTab.isDirty) {
      setActiveTabId(firstTab.id);
      setPendingCloseTabId(firstTab.id);
      setTabClosingQueue(tabIds.slice(1));
    } else {
      setTabClosingQueue(tabIds.slice(1));
      executeCloseTab(firstTab.id, tabIds.slice(1));
    }
  };

const updateTab = (id, updates) => {
  setTabs((prevTabs) =>
    prevTabs.map((tab) =>
      tab.id === id
        ? { ...tab, ...updates }
        : tab
    )
  );
};


  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        activateTab,
        closeTab,
        closeAllTabs, //  اضافه شد
        updateTab,
        pendingCloseTabId, //  اضافه شد
        setPendingCloseTabId, //  اضافه شد
        showCloseAllModal, //  اضافه شد
        setShowCloseAllModal, //  اضافه شد
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export default TabProvider;