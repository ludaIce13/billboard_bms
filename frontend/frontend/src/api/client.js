import axios from 'axios';

const client = axios.create({
  baseURL: 'https://billboard-bms-backend.onrender.com/api',
});

export default client;
