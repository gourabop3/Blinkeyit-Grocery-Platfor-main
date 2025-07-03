import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

//sending access token in the header
Axios.interceptors.request.use(
  async (config) => {
    // Debug log: outgoing request
    console.log("[AXIOS][REQUEST]", {
      method: config.method,
      url: config.baseURL + config.url,
      withAuth: Boolean(config.headers.Authorization),
    });
    const accessToken = sessionStorage.getItem("accesstoken") || localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Extend the life span of the access token with the help of refresh token
Axios.interceptors.response.use(
  (response) => {
    console.log("[AXIOS][RESPONSE]", {
      url: response.config.url,
      status: response.status,
      success: true,
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.log("[AXIOS][RESPONSE][ERROR]", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.log("[AXIOS][ERROR] Network or CORS", error.message);
    }

    if (!error.response) {
      // Network / CORS error or request was cancelled
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");

      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    console.log("response refreshToken: ", response);

    const accessToken = response.data.data.accessToken;
    sessionStorage.setItem("accesstoken", accessToken);
    return accessToken;
  } catch (error) {
    console.log(error);
  }
};

export default Axios;
