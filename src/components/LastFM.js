import axios from 'axios';

export default axios.create({
    baseURL: 'https://ws.audioscrobbler.com/2.0'
});