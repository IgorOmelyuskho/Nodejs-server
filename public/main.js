function useInterceptor() {
  axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, function (err) {
    return Promise.reject(err);
  });
}

useInterceptor();