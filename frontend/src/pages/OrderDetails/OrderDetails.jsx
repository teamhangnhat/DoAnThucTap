import {

    useEffect,

    useState

} from "react";


import {

    useNavigate,

    useParams

} from "react-router-dom";


import {

    FaArrowLeft,

    FaBoxOpen,

    FaShoppingBag

} from "react-icons/fa";


import {

    getOrderDetails

} from "../../services/checkoutService";


// =====================================================
// API URL
// =====================================================

const API_URL =

    "http://localhost:5000";


// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (

    imagePath

) => {


    if (

        !imagePath

    ) {

        return "/placeholder.png";

    }


    if (

        imagePath.startsWith(

            "http://"

        ) ||

        imagePath.startsWith(

            "https://"

        )

    ) {

        return imagePath;

    }


    return `${API_URL}${

        imagePath.startsWith("/")

            ? imagePath

            : `/${imagePath}`

    }`;

};


// =====================================================
// MONEY
// =====================================================

const formatMoney = (

    value

) => {


    return Number(

        value || 0

    ).toLocaleString(

        "vi-VN"

    ) + "₫";

};


// =====================================================
// DATE
// =====================================================

const formatDate = (

    value

) => {


    if (

        !value

    ) {

        return "-";

    }


    return new Date(

        value

    ).toLocaleString(

        "vi-VN"

    );

};


// =====================================================
// ORDER DETAILS
// =====================================================

function OrderDetails() {


    const navigate =

        useNavigate();


    const {

        id

    } = useParams();


    const [

        order,

        setOrder

    ] = useState(null);


    const [

        items,

        setItems

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        error,

        setError

    ] = useState("");


    // =================================================
    // LOAD
    // =================================================

    useEffect(() => {


        const loadDetails =

            async () => {


                try {


                    setLoading(

                        true

                    );


                    const data =

                        await getOrderDetails(

                            id

                        );


                    setOrder(

                        data.order

                    );


                    setItems(

                        data.items || []

                    );


                }

                catch (

                    err

                ) {


                    console.error(

                        "ORDER DETAILS ERROR:",

                        err

                    );


                    setError(

                        err.response?.data?.message ||

                        "Failed to load order details."

                    );

                }

                finally {


                    setLoading(

                        false

                    );

                }

            };


        loadDetails();


    }, [

        id

    ]);


    // =================================================
    // LOADING
    // =================================================

    if (

        loading

    ) {


        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">


                <div className="text-center">


                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />


                    <p className="text-gray-500">


                        Loading order details...


                    </p>


                </div>


            </main>

        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (

        error

    ) {


        return (

            <main className="min-h-screen bg-[#f8f8f6] px-5 py-16">


                <div className="max-w-4xl mx-auto">


                    <button

                        onClick={() =>

                            navigate(

                                "/orders"

                            )

                        }

                        className="flex items-center gap-3 text-gray-500 hover:text-black mb-8"

                    >


                        <FaArrowLeft />

                        Back to Orders


                    </button>


                    <div className="bg-white rounded-[2rem] p-10 text-center">


                        <p className="text-red-500">


                            {error}


                        </p>


                    </div>


                </div>


            </main>

        );

    }


    // =================================================
    // NOT FOUND
    // =================================================

    if (

        !order

    ) {


        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">


                <div className="text-center">


                    <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-5" />


                    <h1 className="text-2xl font-bold">


                        Order not found


                    </h1>


                </div>


            </main>

        );

    }


    // =================================================
    // SUBTOTAL
    // =================================================

    const subtotal =

        items.reduce(

            (

                total,

                item

            ) => {


                return total +

                    Number(

                        item.unit_price

                    ) *

                    Number(

                        item.quantity

                    );

            },

            0

        );


    // =================================================
    // PAGE
    // =================================================

    return (

        <main className="min-h-screen bg-[#f8f8f6] py-10 sm:py-16">


            <div className="max-w-6xl mx-auto px-5 sm:px-8">


                {/* BACK */}

                <button

                    onClick={() =>

                        navigate(

                            "/orders"

                        )

                    }

                    className="flex items-center gap-3 text-gray-500 hover:text-black mb-8"

                >


                    <FaArrowLeft />

                    Back to Orders


                </button>


                {/* HEADER */}

                <div className="mb-10">


                    <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">


                        Order Details


                    </p>


                    <h1 className="text-4xl sm:text-5xl font-bold">


                        Order #{order.id}


                    </h1>


                </div>


                {/* ORDER INFO */}

                <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm mb-8">


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                        <div>


                            <p className="text-sm text-gray-500 mb-2">


                                Order Date


                            </p>


                            <p className="font-semibold">


                                {formatDate(

                                    order.order_date

                                )}


                            </p>


                        </div>


                        <div>


                            <p className="text-sm text-gray-500 mb-2">


                                Status


                            </p>


                            <span className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm">


                                {order.status}


                            </span>


                        </div>


                        <div>


                            <p className="text-sm text-gray-500 mb-2">


                                Payment


                            </p>


                            <p className="font-semibold">


                                {order.payment_method}


                            </p>


                        </div>


                    </div>


                </section>


                {/* PRODUCTS */}

                <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm mb-8">


                    <div className="flex items-center gap-3 mb-7">


                        <FaShoppingBag />


                        <h2 className="text-2xl font-bold">


                            Products


                        </h2>


                    </div>


                    <div className="space-y-6">


                        {items.map(

                            item => (


                                <div

                                    key={

                                        item.id

                                    }

                                    className="flex gap-5 border-b border-gray-100 pb-6 last:border-0 last:pb-0"

                                >


                                    <div className="w-24 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">


                                        <img

                                            src={getImageUrl(

                                                item.color_image ||

                                                item.image_url

                                            )}

                                            alt={

                                                item.product_name

                                            }

                                            className="w-full h-full object-cover"

                                            onError={(event) => {


                                                event.currentTarget.src =

                                                    "/placeholder.png";


                                            }}

                                        />


                                    </div>


                                    <div className="flex-1">


                                        <h3 className="font-bold text-lg">


                                            {item.product_name}


                                        </h3>


                                        <div className="text-sm text-gray-500 mt-2 space-y-1">


                                            {item.size && (


                                                <p>


                                                    Size:{" "}

                                                    {item.size}


                                                </p>


                                            )}


                                            {item.color_name && (


                                                <p>


                                                    Color:{" "}

                                                    {item.color_name}


                                                </p>


                                            )}


                                            <p>


                                                Quantity:{" "}

                                                {item.quantity}


                                            </p>


                                        </div>


                                    </div>


                                    <div className="text-right">


                                        <p className="font-bold">


                                            {formatMoney(

                                                Number(

                                                    item.unit_price

                                                ) *

                                                Number(

                                                    item.quantity

                                                )

                                            )}


                                        </p>


                                        <p className="text-sm text-gray-500 mt-2">


                                            {formatMoney(

                                                item.unit_price

                                            )}


                                        </p>


                                    </div>


                                </div>

                            )

                        )}

                    </div>


                </section>


                {/* SHIPPING ADDRESS */}

                <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm mb-8">


                    <h2 className="text-2xl font-bold mb-5">


                        Shipping Address


                    </h2>


                    <div className="text-gray-600 space-y-1">


                        <p className="font-semibold text-black">


                            {order.address?.receiver_name}


                        </p>


                        <p>


                            {order.address?.phone}


                        </p>


                        <p>


                            {order.address?.address_detail}


                        </p>


                        <p>


                            {order.address?.ward},{" "}

                            {order.address?.district},{" "}

                            {order.address?.city}


                        </p>


                    </div>


                </section>


                {/* SUMMARY */}

                <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm">


                    <h2 className="text-2xl font-bold mb-7">


                        Order Summary


                    </h2>


                    <div className="space-y-5">


                        <div className="flex justify-between">


                            <span className="text-gray-500">


                                Subtotal


                            </span>


                            <strong>


                                {formatMoney(

                                    subtotal

                                )}


                            </strong>


                        </div>


                        <div className="flex justify-between">


                            <span className="text-gray-500">


                                Shipping


                            </span>


                            <strong>


                                {Number(

                                    order.shipping_fee

                                ) === 0

                                    ? "FREE"

                                    : formatMoney(

                                        order.shipping_fee

                                    )

                                }


                            </strong>


                        </div>


                        <div className="flex justify-between text-green-600">


                            <span>


                                Discount


                            </span>


                            <strong>


                                -

                                {formatMoney(

                                    order.discount_amount

                                )}


                            </strong>


                        </div>


                        <div className="border-t border-gray-200 pt-6 flex justify-between text-xl font-bold">


                            <span>


                                Total


                            </span>


                            <span>


                                {formatMoney(

                                    order.total_amount

                                )}


                            </span>


                        </div>


                    </div>


                </section>


            </div>


        </main>

    );

}


export default OrderDetails;