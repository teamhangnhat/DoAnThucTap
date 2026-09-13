const sql = require("mssql");


// =====================================================
// DATABASE CONFIGURATION
// =====================================================

const config = {

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    server: process.env.DB_SERVER,

    database: process.env.DB_DATABASE,

    options: {

        encrypt: false,

        trustServerCertificate: true

    },

    pool: {

        max: 10,

        min: 0,

        idleTimeoutMillis: 30000

    }

};


// =====================================================
// DATABASE CONNECTION
// =====================================================

let poolPromise = null;


const connectDB = async () => {

    try {

        if (!poolPromise) {

            poolPromise = sql.connect(config);

        }


        const pool = await poolPromise;


        console.log(
            "SQL Server connected successfully"
        );


        return pool;

    }

    catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );


        poolPromise = null;


        throw error;

    }

};


// =====================================================
// GET POOL
// =====================================================

const getPool = async () => {

    return await connectDB();

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    sql,

    config,

    connectDB,

    getPool

};