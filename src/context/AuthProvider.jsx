
import {useState} from "react";
import { AuthContext } from "./AuthContext";


export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState ( localStorage.getItem("token"));
 const [user, setUser] = useState(() => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null }); //برای داشتن اطلاعات یوزر و اگه خالی بود کرش نکنه

  // وقتی اپ لود میشه اگر توکن تو localStorage بود ستش کن
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []); //وقتی اپ برای اولین بار باز شد:برو ببین تو localStorage توکن هست؟ اگر هست، داخل state بذارش چرا؟ چون اگر کاربر قبلاً لاگین کرده بود بعد صفحه رو رفرش کنه ما نباید بندازیمش بیرون.

  const login = (token , userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData))
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  

  return (
    <AuthContext.Provider value={{ token,user, login, logout }}>
    
      {children}
      
    </AuthContext.Provider>
  );
};
