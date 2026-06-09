import api from '../api/axios';

export const loginUser = (username , password)=>{

    return api.post("/auth/login",{username,password});
};