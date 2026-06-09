import React, { useState } from "react";
import styles from "./Login.module.css";
// import axios from "axios"; با api هندل میکنیم
// import api from "../../api/axios"; // axios interceptors // حذف شد چون سرویسیش کردیم
import {loginUser} from '../../services/authService' ; // ای پی آی رو از لاگین جدا کنیم که تغییرم کرد همجا نگردیم دنبالش
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import {AuthContext} from '../../context/AuthContext';




const Login = () => {


const { login } = useContext(AuthContext);
const [username , setUserName]=useState("");
const [password , setPassword]=useState("");
const [loginError , setLoginError]=useState(false)
const navigate = useNavigate();
const [loading , setLoading] = useState(false); 

const handleLogin =()=>{
      setLoading(true);
    // let params ={username,password}
    // axios.post('https://dummyjson.com/auth/login', params)
    // 
    // api.post("/auth/login", params) // این رو حذف کردیم که ای پی آی نباشه تو یو آی و در صورت تغییر دنبالش نگردیم سرویسی باشه

    loginUser(username,password)   
    .then((res)=>{
        
        // localStorage.setItem("token",res.data.data.token);
        login(res.data.accessToken,res.data)
        navigate("/dashboard");
        setLoginError(false);
        //  console.log(res)

    })
    .catch((error)=>{
        setLoginError(true);
        console.log(error);
        
        
    })
    .finally(() => {
      setLoading(false);
    });;//هم در موفقیت اجرا میشه هم در خطا پس دیگه لازم نیست توی هر دو جا بنویسیم
}


    return( 

<div className={styles.container}>       
    <div className={styles.wrapper}>
    <h1>Welcome, Please Login!</h1>
    <input value={username} onChange={(event)=>setUserName(event.target.value)} type="text" placeholder="Username" /> 
    <input value={password} onChange={(event)=>setPassword(event.target.value)} type="password" placeholder="Password" />
    {loginError && <div className={styles.login_error}>Wrong Username or Password !</div>}
    <button onClick={handleLogin}  disabled={loading}> {loading ? "Loading ..." : "Login"}</button>

  </div>
</div>
  );
};

export default Login;