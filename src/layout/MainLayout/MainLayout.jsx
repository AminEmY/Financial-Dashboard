import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import GlobalTabs from "../../components/Tabs/GlobalTabs";
import TabContent from "../../components/Tabs/TabContent";
import useTabs from "../../context/useTabs";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  const { tabs, activeTabId } = useTabs();

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

    </div>
  );
};

export default MainLayout;