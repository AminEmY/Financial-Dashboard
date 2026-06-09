import { useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";


//   const isTokenExpired = (token) => {
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));

//     return payload.exp * 1000 < Date.now();
//   } catch {
//     return true;
//   }
// }; // اکسپایر شدن توکن رو چک کنیم 

//حالا توسط اکسیوس api کنترل میشه
 

const ProtectedRoute = ({ children }) => {

  const { token } = useContext(AuthContext);
  

// useEffect(() => {
//     if (token && isTokenExpired(token)) {
//       logout();
//     }
//   }, [token , logout]); //حالا توسط اکسیوس api کنترل میشه


  if (!token) {
    return <Navigate to="/login" replace />; // replace// فرض کن کاربر رفت:و لاگین نبود. می‌فرسته‌اش:اما /dashboard داخل History مرورگر می‌مونه.پس اگر دکمه Back مرورگر رو بزنه، دوباره میره روی /dashboard و دوباره ریدایرکت میشه.یعنی:صفحه فعلی را با /login جایگزین کن.در نتیجه /dashboard از History حذف میشه.دکمه Back هم رفتار تمیزتری داره.
  }

  return children;

};

export default ProtectedRoute;