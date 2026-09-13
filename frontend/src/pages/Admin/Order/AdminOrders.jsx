import {

    useEffect,

    useState

} from "react";


import {

    getAdminOrders,

    updateOrderStatus

} from "../../../services/admin/adminOrderService";



function AdminOrders() {


    const [

        orders,

        setOrders

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        updatingId,

        setUpdatingId

    ] = useState(null);



    // =====================================================
    // LOAD ORDERS
    // =====================================================

    const loadOrders = async () => {

        try {

            setLoading(true);


            const response =

                await getAdminOrders();


            setOrders(

                response.data

            );

        }

        catch (error) {

            console.error(

                "Load orders error:",

                error

            );

            alert(

                "Failed to load orders"

            );

        }

        finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        loadOrders();

    }, []);



    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleStatusChange = async (

        orderId,

        newStatus

    ) => {

        try {

            setUpdatingId(orderId);


            await updateOrderStatus(

                orderId,

                newStatus

            );


            setOrders(

                orders.map(

                    (order) =>

                        order.id === orderId

                            ? {

                                ...order,

                                status:

                                    newStatus

                            }

                            : order

                )

            );


            alert(

                "Order status updated successfully"

            );

        }

        catch (error) {

            console.error(

                "Update status error:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Failed to update order status"

            );

        }

        finally {

            setUpdatingId(null);

        }

    };



    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = (

        amount

    ) => {

        return Number(

            amount || 0

        ).toLocaleString(

            "vi-VN"

        ) + " ₫";

    };



    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (

        date

    ) => {

        return new Date(

            date

        ).toLocaleString(

            "vi-VN"

        );

    };



    // =====================================================
    // STATUS STYLE
    // =====================================================

    const getStatusClass = (

        status

    ) => {

        switch (status) {

            case "Completed":

                return "bg-green-100 text-green-700";

            case "Processing":

                return "bg-blue-100 text-blue-700";

            case "Shipping":

                return "bg-purple-100 text-purple-700";

            case "Cancelled":

                return "bg-red-100 text-red-700";

            default:

                return "bg-yellow-100 text-yellow-700";

        }

    };



    if (loading) {

        return (

            <div className="p-8">

                Loading orders...

            </div>

        );

    }



    return (

        <div className="p-8">


            {/* HEADER */}

            <div className="flex justify-between items-center mb-8">


                <div>

                    <h1 className="text-3xl font-bold">

                        Order Management

                    </h1>


                    <p className="text-gray-500 mt-2">

                        Manage customer orders

                    </p>

                </div>


                <div className="bg-black text-white px-5 py-3 rounded-lg">

                    Total Orders:

                    <strong className="ml-2">

                        {orders.length}

                    </strong>

                </div>

            </div>



            {/* TABLE */}

            <div className="bg-white rounded-xl shadow overflow-hidden">


                <div className="overflow-x-auto">


                    <table className="w-full">


                        <thead className="bg-gray-100">


                            <tr>


                                <th className="text-left p-4">

                                    Order ID

                                </th>


                                <th className="text-left p-4">

                                    Customer

                                </th>


                                <th className="text-left p-4">

                                    Contact

                                </th>


                                <th className="text-left p-4">

                                    Total

                                </th>


                                <th className="text-left p-4">

                                    Payment

                                </th>


                                <th className="text-left p-4">

                                    Date

                                </th>


                                <th className="text-left p-4">

                                    Status

                                </th>


                            </tr>

                        </thead>



                        <tbody>


                            {orders.map(

                                (order) => (


                                    <tr

                                        key={

                                            order.id

                                        }

                                        className="border-t hover:bg-gray-50"

                                    >


                                        <td className="p-4 font-semibold">

                                            #

                                            {

                                                order.id

                                            }

                                        </td>


                                        <td className="p-4">


                                            <div className="font-semibold">

                                                {

                                                    order.full_name

                                                }

                                            </div>


                                            <div className="text-sm text-gray-500">

                                                Customer ID:

                                                {" "}

                                                {

                                                    order.customer_id

                                                }

                                            </div>


                                        </td>


                                        <td className="p-4">


                                            <div>

                                                {

                                                    order.email

                                                }

                                            </div>


                                            <div className="text-sm text-gray-500">

                                                {

                                                    order.phone

                                                }

                                            </div>


                                        </td>


                                        <td className="p-4 font-semibold">

                                            {

                                                formatMoney(

                                                    order.total_amount

                                                )

                                            }

                                        </td>


                                        <td className="p-4">


                                            <div>

                                                {

                                                    order.payment_method ||

                                                    "N/A"

                                                }

                                            </div>


                                            <div className="text-sm text-gray-500">

                                                {

                                                    order.payment_status ||

                                                    "N/A"

                                                }

                                            </div>


                                        </td>


                                        <td className="p-4 text-sm">

                                            {

                                                formatDate(

                                                    order.order_date

                                                )

                                            }

                                        </td>


                                        <td className="p-4">


                                            <select

                                                value={

                                                    order.status

                                                }

                                                disabled={

                                                    updatingId ===

                                                    order.id

                                                }

                                                onChange={(e) =>

                                                    handleStatusChange(

                                                        order.id,

                                                        e.target.value

                                                    )

                                                }

                                                className={`px-3 py-2 rounded-lg font-semibold ${getStatusClass(

                                                    order.status

                                                )}`}

                                            >


                                                <option value="Pending">

                                                    Pending

                                                </option>


                                                <option value="Processing">

                                                    Processing

                                                </option>


                                                <option value="Shipping">

                                                    Shipping

                                                </option>


                                                <option value="Completed">

                                                    Completed

                                                </option>


                                                <option value="Cancelled">

                                                    Cancelled

                                                </option>


                                            </select>

                                        </td>

                                    </tr>

                                )

                            )}


                        </tbody>

                    </table>

                </div>


            </div>


        </div>

    );

}


export default AdminOrders;