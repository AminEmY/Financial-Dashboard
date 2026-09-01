import { useNavigate } from "react-router-dom";
import useTabs from "../../context/useTabs";
import { useEffect, useRef } from "react";
import styles from "./GlobalTabs.module.css";

const GlobalTabs = () => {

  const tabsContainerRef = useRef(null);

  const navigate = useNavigate();

  const {
    tabs,
    activeTabId,
    activateTab,
    closeTab,
  } = useTabs();

  const handleTabClick = (tab) => {
    activateTab(tab.id);

    navigate(tab.path);
  };

  const handleCloseTab = (event, tab) => {
    event.stopPropagation();

    closeTab(tab.id);
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
  );
};

export default GlobalTabs;