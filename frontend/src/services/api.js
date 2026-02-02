import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // The Django URL
  timeout: 5000, // Fail if request takes longer than 5 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;