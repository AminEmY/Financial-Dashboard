import api from '../api/axios';

export const loginUser = (username , password)=>{

    return api.post("/auth/login",{username,password});
};//ای پی آی نباشه تو یو آی و در صورت تغییر دنبالش نگردیم سرویسی باشه