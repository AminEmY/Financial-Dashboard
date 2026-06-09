import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.logo}>Finance App</h2>

      <nav>
        <NavLink to="/dashboard" className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }>
          Dashboard
        </NavLink>

        <NavLink to="/transaction" className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }>
          Transactions
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;