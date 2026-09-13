import {
    useEffect,
    useState
} from "react";

import {
    FiDollarSign,
    FiShoppingCart,
    FiPackage,
    FiUsers,
    FiAlertTriangle
} from "react-icons/fi";

import {
    getAdminDashboard
} from "../../../services/admin/adminDashboardService";


function AdminDashboard() {


    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            const response =

                await getAdminDashboard();


            console.log(

                "DASHBOARD DATA:",

                response.data

            );


            setDashboard(

                response.data

            );

        }

        catch (error) {

            console.error(

                "Dashboard error:",

                error

            );

        }

        finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <div className="p-10">

                Loading dashboard...

            </div>

        );

    }


    if (!dashboard) {

        return (

            <div className="p-10 text-red-500">

                Failed to load dashboard

            </div>

        );

    }


    const summary =

        dashboard.summary || {};


    return (

        <div className="p-6">


            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">

                    Dashboard

                </h1>


                <p className="text-gray-500">

                    Overview of your clothing store

                </p>

            </div>


            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-4 gap-5 mb-8">


                {/* REVENUE */}

                <div className="bg-white p-6 rounded-xl shadow">

                    <div className="flex justify-between">

                        <span className="text-gray-500">

                            Total Revenue

                        </span>


                        <FiDollarSign

                            size={24}

                        />

                    </div>


                    <h2 className="text-2xl font-bold mt-4">

                        {Number(

                            summary.total_revenue || 0

                        ).toLocaleString("vi-VN")}

                        đ

                    </h2>

                </div>


                {/* ORDERS */}

                <div className="bg-white p-6 rounded-xl shadow">

                    <div className="flex justify-between">

                        <span className="text-gray-500">

                            Total Orders

                        </span>


                        <FiShoppingCart

                            size={24}

                        />

                    </div>


                    <h2 className="text-2xl font-bold mt-4">

                        {

                            summary.total_orders || 0

                        }

                    </h2>

                </div>


                {/* PRODUCTS */}

                <div className="bg-white p-6 rounded-xl shadow">

                    <div className="flex justify-between">

                        <span className="text-gray-500">

                            Total Products

                        </span>


                        <FiPackage

                            size={24}

                        />

                    </div>


                    <h2 className="text-2xl font-bold mt-4">

                        {

                            summary.total_products || 0

                        }

                    </h2>

                </div>


                {/* CUSTOMERS */}

                <div className="bg-white p-6 rounded-xl shadow">

                    <div className="flex justify-between">

                        <span className="text-gray-500">

                            Total Customers

                        </span>


                        <FiUsers

                            size={24}

                        />

                    </div>


                    <h2 className="text-2xl font-bold mt-4">

                        {

                            summary.total_customers || 0

                        }

                    </h2>

                </div>

            </div>


            {/* SECONDARY SUMMARY */}

            <div className="grid grid-cols-3 gap-5 mb-8">


                <div className="bg-white p-6 rounded-xl shadow">

                    <p className="text-gray-500">

                        Pending Orders

                    </p>


                    <h2 className="text-2xl font-bold mt-3">

                        {

                            summary.pending_orders || 0

                        }

                    </h2>

                </div>


                <div className="bg-white p-6 rounded-xl shadow">

                    <p className="text-gray-500">

                        Completed Orders

                    </p>


                    <h2 className="text-2xl font-bold mt-3">

                        {

                            summary.completed_orders || 0

                        }

                    </h2>

                </div>


                <div className="bg-white p-6 rounded-xl shadow">

                    <p className="text-gray-500">

                        Total Stock

                    </p>


                    <h2 className="text-2xl font-bold mt-3">

                        {

                            summary.total_stock || 0

                        }

                    </h2>

                </div>

            </div>


            {/* RECENT ORDERS + BEST SELLING */}

            <div className="grid grid-cols-2 gap-6 mb-8">


                {/* RECENT ORDERS */}

                <div className="bg-white rounded-xl shadow">


                    <div className="p-5 border-b">

                        <h2 className="text-xl font-bold">

                            Recent Orders

                        </h2>

                    </div>


                    <div className="p-5">


                        {dashboard.recentOrders

                            ?.length === 0 ? (

                            <p className="text-gray-500">

                                No orders yet.

                            </p>

                        ) : (

                            dashboard.recentOrders

                                ?.map((order) => (

                                    <div

                                        key={order.id}

                                        className="flex justify-between border-b py-4"

                                    >

                                        <div>

                                            <p className="font-semibold">

                                                Order #

                                                {

                                                    order.id

                                                }

                                            </p>


                                            <p className="text-sm text-gray-500">

                                                {

                                                    order.full_name

                                                }

                                            </p>

                                        </div>


                                        <div className="text-right">

                                            <p className="font-semibold">

                                                {Number(

                                                    order.total_amount

                                                ).toLocaleString(

                                                    "vi-VN"

                                                )}

                                                đ

                                            </p>


                                            <p className="text-sm">

                                                {

                                                    order.status

                                                }

                                            </p>

                                        </div>

                                    </div>

                                ))

                        )}

                    </div>

                </div>


                {/* BEST SELLING */}

                <div className="bg-white rounded-xl shadow">


                    <div className="p-5 border-b">

                        <h2 className="text-xl font-bold">

                            Best Selling Products

                        </h2>

                    </div>


                    <div className="p-5">


                        {dashboard.bestSellingProducts

                            ?.length === 0 ? (

                            <p className="text-gray-500">

                                No sales data yet.

                            </p>

                        ) : (

                            dashboard.bestSellingProducts

                                ?.map((product) => (

                                    <div

                                        key={product.id}

                                        className="flex justify-between border-b py-4"

                                    >

                                        <div>

                                            <p className="font-semibold">

                                                {

                                                    product.product_name

                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <span className="font-bold">

                                                {

                                                    product.total_sold

                                                }

                                                sold

                                            </span>

                                        </div>

                                    </div>

                                ))

                        )}

                    </div>

                </div>

            </div>


            {/* LOW STOCK */}

            <div className="bg-white rounded-xl shadow mb-8">


                <div className="p-5 border-b flex items-center gap-3">

                    <FiAlertTriangle

                        className="text-red-500"

                    />


                    <h2 className="text-xl font-bold">

                        Low Stock Products

                    </h2>

                </div>


                <div className="p-5">


                    {dashboard.lowStockProducts

                        ?.length === 0 ? (

                        <p className="text-gray-500">

                            No low stock products.

                        </p>

                    ) : (

                        dashboard.lowStockProducts

                            ?.map((product) => (

                                <div

                                    key={product.id}

                                    className="flex justify-between border-b py-4"

                                >

                                    <span>

                                        {

                                            product.product_name

                                        }

                                    </span>


                                    <span className="text-red-600 font-bold">

                                        Stock: {

                                            product.stock

                                        }

                                    </span>

                                </div>

                            ))

                    )}

                </div>

            </div>

        </div>

    );

}


export default AdminDashboard;