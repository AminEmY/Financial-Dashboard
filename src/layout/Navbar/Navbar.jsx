import {  useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import erpLogo from "../../assets/logo/erp-logo.svg";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log(user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); //و Login جای Dashboard رو توی History می‌گیره.در نتیجه اگر کاربر بعد از Logout دکمه Back مرورگر رو بزنه، برنمی‌گرده به Dashboard.
  };

  return (

  <div className={styles.container}>

    <img className={styles.logo}  src={erpLogo} alt="خطا در بارگذاری لوگو" />        

    <div className={styles.navbar}>

    <h3>{user?.firstName}</h3>
      
    <button onClick={handleLogout}>خروج</button>

    </div>
    
  </div>   
  
  );
};

export default Navbar;