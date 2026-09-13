import {

    Routes,

    Route

} from "react-router-dom";


import Layout

    from "../components/layout/Layout";


import ScrollToTop

    from "../components/common/ScrollToTop";


import Home

    from "../pages/Home/Home";


import Login

    from "../pages/Login/Login";


import Register

    from "../pages/Register/Register";


import Product

    from "../pages/Product/Product";


import ProductDetail

    from "../pages/ProductDetail/ProductDetail";


import Cart

    from "../pages/Cart/Cart";


import Checkout

    from "../pages/Checkout/Checkout";


import Orders

    from "../pages/Orders/Orders";


import OrderDetails

    from "../pages/OrderDetails/OrderDetails";


import Profile

    from "../pages/Profile/Profile";


import Address

    from "../pages/Address/Address";


import Wishlist

    from "../pages/Wishlist/Wishlist";
import PaymentSuccess
    from "../pages/Payment/PaymentSuccess";
import PaymentCancel from "../pages/Payment/PaymentCancel";
// =====================================================
// ADMIN
// =====================================================

import AdminProducts

    from "../pages/Admin/Products/AdminProducts";


import AddProduct

    from "../pages/Admin/Products/AddProduct";


import EditProduct

    from "../pages/Admin/Products/EditProduct";
import AdminLayout
    from "../components/admin/AdminLayout";

import AdminDashboard
    from "../pages/Admin/Dashboard/AdminDashboard";
    import AdminOrders from "../pages/admin/order/AdminOrders";
    import AdminCustomers

    from "../pages/Admin/Customers/AdminCustomers";
import AdminProfile

    from "../pages/Admin/Profile/AdminProfile";
import AdminFlashSales

    from "../pages/Admin/FlashSale/AdminFlashSales";
    import AddFlashSale
    from "../pages/Admin/FlashSale/AddFlashSale";

import EditFlashSale
    from "../pages/Admin/FlashSale/EditFlashSale";
    import AdminRevenue from "../pages/Admin/Revenue/AdminRevenue";
function AppRoutes() {


    return (

        <>


            <ScrollToTop />


            <Routes>


                {/* ================================================= */}
                {/* CUSTOMER ROUTES */}
                {/* ================================================= */}


                <Route

                    element={

                        <Layout />

                    }

                >


                    <Route

                        path="/"

                        element={

                            <Home />

                        }

                    />


                    <Route

                        path="/login"

                        element={

                            <Login />

                        }

                    />


                    <Route

                        path="/register"

                        element={

                            <Register />

                        }

                    />


                    <Route

                        path="/products"

                        element={

                            <Product />

                        }

                    />


                    <Route

                        path="/products/:category"

                        element={

                            <Product />

                        }

                    />


                    <Route

                        path="/products/:category/:subcategory"

                        element={

                            <Product />

                        }

                    />


                    <Route

                        path="/products/detail/:id"

                        element={

                            <ProductDetail />

                        }

                    />


                    <Route

                        path="/wishlist"

                        element={

                            <Wishlist />

                        }

                    />


                    <Route

                        path="/cart"

                        element={

                            <Cart />

                        }

                    />


                    <Route

                        path="/checkout"

                        element={

                            <Checkout />

                        }

                    />


                    <Route

                        path="/orders"

                        element={

                            <Orders />

                        }

                    />


                    <Route

                        path="/orders/:id"

                        element={

                            <OrderDetails />

                        }

                    />


                    <Route

                        path="/profile"

                        element={

                            <Profile />

                        }

                    />
                    <Route
    path="/payment/success"
    element={
        <PaymentSuccess />
    }
/>
<Route
    path="/payment-cancel"
    element={
        <PaymentCancel />
    }
/>


                    <Route

                        path="/address"

                        element={

                            <Address />

                        }

                    />


                </Route>


   {/* ================================================= */}
{/* ADMIN ROUTES */}
{/* ================================================= */}

<Route
    path="/admin"
    element={<AdminLayout />}
>

    {/* /admin */}
    <Route
        index
        element={
            <AdminDashboard />
        }
    />


    {/* /admin/products */}
    <Route
        path="products"
        element={
            <AdminProducts />
        }
    />


    {/* /admin/products/add */}
    <Route
        path="products/add"
        element={
            <AddProduct />
        }
    />


    {/* /admin/products/edit/:id */}
    <Route
        path="products/edit/:id"
        element={
            <EditProduct />
        }
    />


    {/* /admin/customers */}
    <Route
        path="customers"
        element={
            <AdminCustomers />
        }
    />


    {/* /admin/orders */}
    <Route
        path="orders"
        element={
            <AdminOrders />
        }
    />


    {/* /admin/profile */}
    <Route
        path="profile"
        element={
            <AdminProfile />
        }
    />
    <Route

    path="flash-sales"

    element={

        <AdminFlashSales />

    }

/>
<Route
    path="flash-sales/add"
    element={
        <AddFlashSale />
    }
/>

<Route
    path="flash-sales/edit/:id"
    element={
        <EditFlashSale />
    }
/>
 <Route
    path="revenue"
    element={
        <AdminRevenue />
    }
/>
</Route>





            </Routes>


        </>

    );

}


export default AppRoutes;