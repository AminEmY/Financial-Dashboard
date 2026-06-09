import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
});// به جای اینکه هر بار بنویسیم آدرسو


// 1. Request Interceptor (قبل از ارسال درخواست)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. Response Interceptor (بعد از گرفتن جواب)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; //❌ نمی‌تونیم مستقیم navigate() استفاده کنیم فقط داخل component کار می‌کنه✔ چون interceptor بیرون از React Router اجرا میشه
    }

    return Promise.reject(error);
  }
);

export default api;