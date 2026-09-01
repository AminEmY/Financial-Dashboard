import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import menuConfig from "../../config/menuConfig";
import useTabs from "../../context/useTabs";

const Sidebar = () => {

    const [openMenus, setOpenMenus] = useState([]);

    const { openTab, activateTab, tabs } = useTabs();


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


    const renderMenu = (items) => {

        return items.map((item) => {

            const hasChildren = item.children?.length > 0;

            const isOpen = openMenus.includes(item.title);


            // ============================
            // PARENT MENU
            // ============================

            if (hasChildren) {

                return (
                    <div key={item.title}>

                        <div
                            className={styles.menuParent}
                            onClick={() =>
                                toggleMenu(item.title)
                            }
                        >
                            {item.title}
                        </div>


                        {isOpen && (
                            <div className={styles.subMenu}>
                                {renderMenu(item.children)}
                            </div>
                        )}

                    </div>
                );
            }


            // ============================
            // LEAF MENU
            // ============================

            return (
                <NavLink
                    key={item.title}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                        isActive
                            ? styles.active
                            : styles.link
                    }
                    onClick={(event) => {

                        event.preventDefault();

                        handleOpenTab(item);

                    }}
                >
                    {item.title}
                </NavLink>
            );

        });

    };


    return (
        <div className={styles.sidebar}>

            <nav>

                {renderMenu(menuConfig)}

            </nav>

        </div>
    );
};

export default Sidebar;