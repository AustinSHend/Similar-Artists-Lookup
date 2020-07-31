import axios from 'axios';
import rateLimit from 'axios-rate-limit';

export default rateLimit(
    axios.create({
        baseURL: 'https://api.discogs.com/'
    }),
    {
        maxRequests: 60,
        perMilliseconds: 60000
    }
);