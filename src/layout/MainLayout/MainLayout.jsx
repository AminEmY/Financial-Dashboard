import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import GlobalTabs from "../../components/Tabs/GlobalTabs";
import TabContent from "../../components/Tabs/TabContent";
import { useEffect } from "react";
import useTabs from "../../context/useTabs";
import styles from "./MainLayout.module.css";
import CloseUnsavedModal from "../../components/tabs/CloseUnsavedModal"; //  این  اضافه شد

const MainLayout = () => {


  const { tabs, activeTabId, closeTab } = useTabs();

  //  اضافه کردن این useEffect برای بستن توسط کلیک وسط موس در هر جای صفحه
  useEffect(() => {
      const handleGlobalMiddleClick = (e) => {
        if (e.button === 1) { // کلیک وسط موس
          const currentTab = tabs.find((t) => t.id === activeTabId);
          
          if (currentTab && currentTab.closable) {
            e.preventDefault();
            e.stopPropagation();
            closeTab(currentTab.id);
          }
        }
      };

      // 🟢 استفاده از mousedown با حالت capture برای مهار کردن کلیک وسط حتی روی گرید و سلول‌های آن
      window.addEventListener("mousedown", handleGlobalMiddleClick, { capture: true });
      
      return () => {
        window.removeEventListener("mousedown", handleGlobalMiddleClick, { capture: true });
      };
    }, [tabs, activeTabId, closeTab]);


return (
    <div className={styles.layout}>

      <Sidebar />

      <div className={styles.content}>

        <Navbar />

        <GlobalTabs />

        <div className={styles.page}>

          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={
                tab.id === activeTabId
                  ? styles.tabPanelActive
                  : styles.tabPanel
              }
            >
              <TabContent tab={tab} />
            </div>
          ))}

        </div>

      </div>
      <CloseUnsavedModal />

    </div>
  );
};

export default MainLayout;