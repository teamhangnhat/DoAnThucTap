import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaArrowLeft,
    FaBoxOpen,
    FaEye
} from "react-icons/fa";

import {
    getMyOrders
} from "../../services/checkoutService";


function Orders() {


    const navigate =
        useNavigate();


    const [

        orders,

        setOrders

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        error,

        setError

    ] = useState("");


    useEffect(

        () => {


            const loadOrders =
                async () => {


                    try {


                        const user =

                            JSON.parse(

                                localStorage.getItem(
                                    "user"
                                )

                            );


                        if (

                            !user?.id

                        ) {

                            navigate(
                                "/login"
                            );

                            return;

                        }


                        const data =

                            await getMyOrders();


                        setOrders(
                            data
                        );

                    }


                    catch (err) {


                        console.error(
                            err
                        );


                        setError(

                            err.response
                                ?.data
                                ?.message

                            ||

                            "Failed to load orders."

                        );

                    }


                    finally {

                        setLoading(
                            false
                        );

                    }

                };


            loadOrders();


        },

        [navigate]

    );


    const formatMoney =
        (value) => {


            return Number(
                value || 0
            ).toLocaleString(
                "vi-VN"
            )

            + "₫";

        };


    const formatDate =
        (date) => {


            return new Date(
                date
            ).toLocaleString(
                "vi-VN"
            );

        };


    const getStatusClass =
        (status) => {


            switch (

                status
                    ?.toLowerCase()

            ) {

                case "pending":

                    return "bg-yellow-100 text-yellow-700";


                case "processing":

                    return "bg-blue-100 text-blue-700";


                case "completed":

                    return "bg-green-100 text-green-700";


                case "cancelled":

                    return "bg-red-100 text-red-700";


                default:

                    return "bg-gray-100 text-gray-700";

            }

        };


    if (

        loading

    ) {

        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-gray-500">

                        Loading orders...

                    </p>

                </div>

            </main>

        );

    }


    return (

        <main className="min-h-screen bg-[#f8f8f6] py-10 sm:py-16">

            <div className="max-w-6xl mx-auto px-5 sm:px-8">


                {/* BACK */}

                <button

                    type="button"

                    onClick={() =>
                        navigate(-1)
                    }

                    className="flex items-center gap-3 text-gray-500 hover:text-black mb-8"

                >

                    <FaArrowLeft />

                    Back

                </button>


                {/* HEADER */}

                <div className="mb-10">

                    <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">

                        Your Shopping History

                    </p>


                    <h1 className="text-4xl sm:text-5xl font-bold">

                        My Orders

                    </h1>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-6">

                        {error}

                    </div>

                )}


                {/* EMPTY */}

                {orders.length === 0 ? (

                    <div className="bg-white rounded-[2rem] p-14 text-center shadow-sm">

                        <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-6" />


                        <h2 className="text-2xl font-bold mb-3">

                            No orders yet

                        </h2>


                        <p className="text-gray-500 mb-7">

                            Your completed orders will appear here.

                        </p>


                        <button

                            type="button"

                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }

                            className="bg-black text-white px-8 py-4 rounded-full font-bold"

                        >

                            SHOP NOW

                        </button>

                    </div>

                ) : (

                    <div className="space-y-6">


                        {orders.map(

                            (order) => (

                                <div

                                    key={
                                        order.id
                                    }

                                    className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm"

                                >


                                    {/* TOP */}

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">


                                        <div>

                                            <p className="text-sm text-gray-400">

                                                Order #

                                                {
                                                    order.id
                                                }

                                            </p>


                                            <p className="font-medium mt-1">

                                                {
                                                    formatDate(
                                                        order.order_date
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <span

                                            className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                                                order.status
                                            )}`}

                                        >

                                            {
                                                order.status
                                            }

                                        </span>

                                    </div>


                                    {/* INFO */}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-y border-gray-100 py-6">


                                        <div>

                                            <p className="text-sm text-gray-400 mb-1">

                                                Total

                                            </p>


                                            <p className="font-bold text-lg">

                                                {
                                                    formatMoney(
                                                        order.total_amount
                                                    )
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-400 mb-1">

                                                Payment

                                            </p>


                                            <p className="font-medium">

                                                {
                                                    order.payment_method
                                                }

                                            </p>


                                            <p className="text-sm text-gray-500">

                                                {
                                                    order.payment_status
                                                }

                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-400 mb-1">

                                                Shipping to

                                            </p>


                                            <p className="font-medium">

                                                {
                                                    order.receiver_name
                                                }

                                            </p>


                                            <p className="text-sm text-gray-500">

                                                {
                                                    order.address_detail
                                                }

                                            </p>

                                        </div>

                                    </div>


                                    {/* BUTTON */}

                                    <div className="flex justify-end mt-6">

                                        <button

                                            type="button"

                                            onClick={() =>

                                                navigate(

                                                    `/orders/${order.id}`

                                                )

                                            }

                                            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold"

                                        >

                                            <FaEye />

                                            View Details

                                        </button>

                                    </div>

                                </div>

                            )

                        )}

                    </div>

                )}

            </div>

        </main>

    );

}


export default Orders;