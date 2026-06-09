import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.content}>
        <Navbar /> 
        <div className={styles.page}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;