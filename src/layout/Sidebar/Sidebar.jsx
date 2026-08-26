import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./Sidebar.module.css";
import menuConfig from "../../config/menuConfig"

const Sidebar = () => {

    const [openMenus, setOpenMenus] = useState([]);


    const toggleMenu = (title)=>{

        setOpenMenus(prev => 
            prev.includes(title)
            ? prev.filter(item=>item !== title)
            : [...prev,title]
        );

    };


    const renderMenu = (items)=>{

        return items.map((item)=>{


            const hasChildren = item.children?.length > 0;

            const isOpen = openMenus.includes(item.title);


            if(hasChildren){

                return (
                    <div key={item.title}>

                        <div
                            className={styles.menuParent}
                            onClick={()=>toggleMenu(item.title)}
                        >
                            {item.title}

                            <span>
                                {isOpen ? "▲" : "▼"}
                            </span>

                        </div>


                        {
                            isOpen &&
                            <div className={styles.subMenu}>
                                {renderMenu(item.children)}
                            </div>
                        }


                    </div>
                )
            }



            return (
                <NavLink
                    key={item.title}
                    to={item.path}
                    end
                    className={({isActive}) =>
                        isActive
                        ? styles.active
                        : styles.link
                    }
                >
                    {item.title}
                </NavLink>
            )


        })


    }


return (
    <div className={styles.sidebar}>

      <nav>

        {renderMenu(menuConfig)}
        {/* <NavLink to="/dashboard" className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }>
          Dashboard
        </NavLink>

        <NavLink to="/Vouchers" className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }>
          Vouchers List
        </NavLink> */}
      </nav>
      
    </div>
  );
};

export default Sidebar;