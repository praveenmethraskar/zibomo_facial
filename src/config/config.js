// src/config/config.js
import dotenv from 'dotenv';
dotenv.config();
const config = {
    db: process.env.MONGO_URI,
    username: '...',
    password: '...',
    port: '',
    logger: ''
    // ...
}



const environment = process.env.NODE_ENV
if (environment == "testing") {
    config.db = process.env.MONGO_TEST_CONN_URL
    config.logger = 'dev'
    config.port = '3000'
    config.testing = {
        port: process.env.PORT || 3001,
        saltingRounds: 10
    }
} else if (environment == "development") {
    config.db = process.env.MONGO_URI
    config.logger = 'dev'
    config.port = '3000'
    config.development = {
        port: process.env.PORT || 3000,
        saltingRounds: 10
    }
} else {
    db = process.env.MONGO_URI
    config.port = '8000'
    config.production = {
        saltingRounds: 10
    }
}

export default config
