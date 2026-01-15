import axios from 'axios';

const client = axios.create({
  baseURL: 'https://your-backend-service.onrender.com/api',
});

export default client;
