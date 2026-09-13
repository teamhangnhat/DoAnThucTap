require("dotenv").config();


const cors = require("cors");

const express = require("express");

const path = require("path");


const {

    sql,

    config

} = require("./config/db");


// =====================================================
// CUSTOMER ROUTES
// =====================================================

const userRoutes =

    require("./routes/userRoutes");


const authRoutes =

    require("./routes/authRoutes");


const productRoutes =

    require("./routes/productRoutes");


const categoryRoutes =

    require("./routes/categoryRoutes");


const cartRoutes =

    require("./routes/cartRoutes");


const orderRoutes =

    require("./routes/orderRoutes");


const addressRoutes =

    require("./routes/addressRoutes");


const homeRoutes =

    require("./routes/homeRoutes");


const wishlistRoutes =

    require("./routes/wishlistRoutes");
const membershipRoutes = require(

    "./routes/membershipRoutes"

);
const paymentRoutes = require("./routes/paymentRoutes");

// =====================================================
// ADMIN ROUTES
// =====================================================

const adminProductRoutes =

    require(

        "./routes/Admin/adminProductRoutes"

    );
const adminDashboardRoutes = require(

    "./routes/Admin/adminDashboardRoutes"

);

const adminOrderRoutes = require(
    "./routes/admin/adminOrderRoutes"
);
const adminCustomerRoutes = require(

    "./routes/admin/adminCustomerRoutes"

);
const adminProfileRoutes = require(
    "./routes/admin/adminProfileRoutes"
);
const adminFlashSaleRoutes = require(

    "./routes/Admin/adminFlashSaleRoutes"

);
const adminRevenueRoutes = require(

    "./routes/Admin/adminRevenueRoutes"

);
// =====================================================
// APP
// =====================================================

const app = express();
const uploadRoutes = require(

    "./routes/uploadRoutes"

);





// =====================================================
// MIDDLEWARE
// =====================================================

app.use(

    cors()

);


app.use(

    express.json()

);




// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(

    "/uploads",

    express.static(

        path.join(

            __dirname,

            "uploads"

        )

    )

);


// =====================================================
// CUSTOMER API ROUTES
// =====================================================




app.use("/api/payment", paymentRoutes);
app.use(

    "/api/upload",

    uploadRoutes

);

app.use(

    "/api/users",

    userRoutes

);


app.use(

    "/api/auth",

    authRoutes

);


app.use(

    "/api/products",

    productRoutes

);


app.use(

    "/api/categories",

    categoryRoutes

);


app.use(

    "/api/cart",

    cartRoutes

);


app.use(

    "/api/orders",

    orderRoutes

);


app.use(

    "/api/address",

    addressRoutes

);


app.use(

    "/api/home",

    homeRoutes

);


app.use(

    "/api/wishlist",

    wishlistRoutes

);
app.use(

    "/api/membership",

    membershipRoutes

);

// =====================================================
// ADMIN API ROUTES
// =====================================================

app.use(

    "/api/admin/products",

    adminProductRoutes

);
app.use(

    "/api/admin/dashboard",

    adminDashboardRoutes

);
app.use(

    "/api/admin/orders",

    adminOrderRoutes

);
app.use(

    "/api/admin/customers",

    adminCustomerRoutes

);
app.use(
    "/api/admin/profile",
    adminProfileRoutes
);
app.use(

    "/api/admin/flash-sales",

    adminFlashSaleRoutes

);
app.use(

    "/api/admin/revenue",

    adminRevenueRoutes

);
// =====================================================
// TEST DATABASE
// =====================================================

app.get(

    "/",

    async (req, res) => {

        try {

            const pool =

                await sql.connect(config);


            const result =

                await pool

                    .request()

                    .query(`

                        SELECT

                            COUNT(*) AS totalUsers

                        FROM users

                    `);


            res.json(

                result.recordset[0]

            );

        }

        catch (err) {

            res.status(500).json({

                error:

                    err.message

            });

        }

    }

);


// =====================================================
// START SERVER
// =====================================================

app.listen(

    5000,

    () => {

        console.log(

            "Server running on port 5000"

        );

    }

);