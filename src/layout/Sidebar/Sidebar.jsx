
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
    DashboardRounded,
    AccountBalanceWalletRounded,
    DescriptionRounded,
    PostAddRounded,
    ListAltRounded,
    AccountTreeRounded,
    ExpandMoreRounded,
    WorkspacesRounded,
} from "@mui/icons-material";

import styles from "./Sidebar.module.css";
import menuConfig from "../../config/menuConfig";
import useTabs from "../../context/useTabs";

const menuIcons = {
    "میز کار": WorkspacesRounded,
    "داشبورد": DashboardRounded,
    "مالی": AccountBalanceWalletRounded,
    "اسناد": DescriptionRounded,
    "ثبت سند": PostAddRounded,
    "لیست اسناد": ListAltRounded,
    "ساختار حساب": AccountTreeRounded,
};

const Sidebar = () => {
    const [openMenus, setOpenMenus] = useState([]);

    const { openTab, activateTab, tabs, activeTabId } = useTabs();

    const toggleMenu = (title) => {
        setOpenMenus((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    const handleOpenTab = (item) => {
        // داشبورد فقط یک تب دارد
        if (item.pageType === "dashboard") {
            const dashboardTab = tabs.find(
                (tab) => tab.pageType === "dashboard"
            );

            if (dashboardTab) {
                activateTab(dashboardTab.id);
                return;
            }
        }

        openTab({
            title: item.title,
            path: item.path,
            pageType: item.pageType,
            closable: item.closable ?? true,
            data: item.data ?? {},
        });
    };

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    const renderMenu = (items, depth = 0) => {
        return items.map((item) => {
            const hasChildren = item.children?.length > 0;
            const isOpen = openMenus.includes(item.title);
            const Icon = menuIcons[item.title];

            if (hasChildren) {
                return (
                    <div
                        key={item.title}
                        className={`${styles.menuGroup} ${
                            depth === 0 ? styles.rootGroup : styles.nestedGroup
                        }`}
                    >
                        <button
                            type="button"
                            className={`${styles.menuParent} ${
                                isOpen ? styles.menuParentOpen : ""
                            }`}
                            onClick={() => toggleMenu(item.title)}
                            aria-expanded={isOpen}
                        >
                            <span className={styles.menuLabel}>
                                {Icon && (
                                    <Icon className={styles.menuIcon} />
                                )}
                                <span>{item.title}</span>
                            </span>

                            <ExpandMoreRounded
                                className={`${styles.expandIcon} ${
                                    isOpen ? styles.expanded : ""
                                }`}
                            />
                        </button>

                        {isOpen && (
                            <div className={styles.subMenu}>
                                {renderMenu(item.children, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            }

            const isTabActive =
                activeTab?.pageType === item.pageType;

            return (
                <NavLink
                    key={item.title}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                        `${styles.link} ${
                            isActive || isTabActive
                                ? styles.active
                                : ""
                        }`
                    }
                    onClick={(event) => {
                        event.preventDefault();
                        handleOpenTab(item);
                    }}
                >
                    <span className={styles.menuLabel}>
                        {Icon && (
                            <Icon className={styles.menuIcon} />
                        )}
                        <span>{item.title}</span>
                    </span>
                </NavLink>
            );
        });
    };

    return (
        <aside className={styles.sidebar}>

            <nav className={styles.navigation}>
                {renderMenu(menuConfig)}
            </nav>
        </aside>
    );
};

export default Sidebar;
