import { useNavigate } from "react-router-dom";
import useTabs from "../../context/useTabs";
import { useEffect, useRef } from "react";
import styles from "./GlobalTabs.module.css";
import CloseUnsavedModal from "../../components/tabs/CloseUnsavedModal"; //  این  اضافه شد

const GlobalTabs = () => {

  const tabsContainerRef = useRef(null);

  const navigate = useNavigate();

  const {
    tabs,
    activeTabId,
    activateTab,
    closeTab,
    closeAllTabs, //  اضافه شد
  } = useTabs();

  const handleTabClick = (tab) => {
    activateTab(tab.id);

    navigate(tab.path);
  };

  const handleCloseTab = (event, tab) => {
    event.stopPropagation();

    closeTab(tab.id);
  };

  // پشتیبانی از کلیک وسط موس روی تب برای بستن
const handleAuxClick = (event, tab) => {
  if (event.button === 1 && tab.closable) { // دکمه 1 یعنی کلیک وسط موس
    event.preventDefault();
    closeTab(tab.id);
  }
};

  useEffect(() => {
    if (!tabsContainerRef.current) return;

    const activeElement =
        tabsContainerRef.current.querySelector(
            `[data-tab-id="${activeTabId}"]`
        );

    if (activeElement) {
        activeElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        });
    }
  }, [activeTabId, tabs]);

  return (

  <div className={styles.tabsWrapper} style={{ display: "flex", alignItems: "center", width: "100%" }}>
    <div ref={tabsContainerRef} className={styles.tabsContainer}>
      <div className={styles.tabs}>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={`${styles.tab} ${
              activeTabId === tab.id
                ? styles.active
                : ""
            }`}
            onClick={() => handleTabClick(tab)}
            onAuxClick={(e) => handleAuxClick(e, tab)} // اضافه شد برای کلیک وسط
          >

            <span className={styles.tabTitle}>
              {tab.title}
            </span>

            {tab.closable && (
              <button
                className={styles.closeButton}
                onClick={(event) =>
                  handleCloseTab(event, tab)
                }
              >
                ×
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
{/* دکمه بستن همه در همان راستا کنار تب‌ها */}
      {tabs.filter(t => t.closable).length > 0 && (
        <button 
          className={styles.closeAllButton}
          onClick={closeAllTabs}
          title="بستن همه تب‌ها"
        >
          بستن همه ×
        </button>
      )}

      <CloseUnsavedModal />
    </div>
  );
    
};

export default GlobalTabs;