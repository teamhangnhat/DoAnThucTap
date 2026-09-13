import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaArrowLeft,
    FaShoppingBag,
    FaCheck
} from "react-icons/fa";

import {
    getCart
} from "../../services/cartService";

import {
    createOrder
} from "../../services/checkoutService";
import {
    createPaymentLink
} from "../../services/paymentService";

// =====================================================
// BACKEND URL
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
// FORMAT MONEY
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
// CHECKOUT
// =====================================================

function Checkout() {


    const navigate =

        useNavigate();


    // =================================================
    // CART ITEMS
    // =================================================

    const [

        cartItems,

        setCartItems

    ] = useState([]);


    // =================================================
    // PROFILE
    // =================================================

    const [

        profile,

        setProfile

    ] = useState({

        full_name: "",

        phone: "",

        address: "",

        city: "",

        district: "",

        ward: ""

    });


    // =================================================
    // PAYMENT METHOD
    // =================================================

    const [

        paymentMethod,

        setPaymentMethod

    ] = useState(

        "COD"

    );


    // =================================================
    // VOUCHER
    // =================================================

    const [

        voucher,

        setVoucher

    ] = useState("");


    const [

        discount,

        setDiscount

    ] = useState(0);


    const [

        voucherApplied,

        setVoucherApplied

    ] = useState(false);


    const [

        voucherMessage,

        setVoucherMessage

    ] = useState("");


    // =================================================
    // STATUS
    // =================================================

    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        processing,

        setProcessing

    ] = useState(false);


    const [

        error,

        setError

    ] = useState("");


    // =================================================
    // LOAD CHECKOUT DATA
    // =================================================

    useEffect(() => {


        const loadCheckout =

            async () => {


                try {


                    setLoading(

                        true

                    );


                    setError("");


                    // =================================
                    // GET USER
                    // =================================

                    const storedUser =

                        JSON.parse(

                            localStorage.getItem(

                                "user"

                            )

                        );


                    if (

                        !storedUser?.id

                    ) {


                        navigate(

                            "/login"

                        );


                        return;

                    }


                    // =================================
                    // LOAD PROFILE
                    // =================================

                    const profileResponse =

                        await fetch(

                            `${API_URL}/api/users/profile/${storedUser.id}`

                        );


                    if (

                        !profileResponse.ok

                    ) {

                        throw new Error(

                            "Failed to load user profile"

                        );

                    }


                    const profileData =

                        await profileResponse.json();


                    setProfile({

                        full_name:

                            profileData.full_name ||

                            "",

                        phone:

                            profileData.phone ||

                            "",

                        address:

                            profileData.address ||

                            profileData.address_detail ||

                            "",

                        city:

                            profileData.city ||

                            "",

                        district:

                            profileData.district ||

                            "",

                        ward:

                            profileData.ward ||

                            ""

                    });


                    // =================================
                    // LOAD EXACT CART
                    // =================================

                    const cartResponse =

                        await getCart(

                            storedUser.id

                        );


                    const items =

                        Array.isArray(

                            cartResponse.data

                        )

                            ? cartResponse.data

                            : [];


                    setCartItems(

                        items

                    );

                }


                catch (

                    err

                ) {


                    console.error(

                        "CHECKOUT LOAD ERROR:",

                        err

                    );


                    setError(

                        err.response?.data?.message ||

                        err.message ||

                        "Failed to load checkout information."

                    );

                }


                finally {


                    setLoading(

                        false

                    );

                }

            };


        loadCheckout();


    }, [

        navigate

    ]);


    // =================================================
    // SUBTOTAL
    // =================================================

    const subtotal =

        cartItems.reduce(

            (

                total,

                item

            ) => {


                const price =

                    Number(

                        item.final_price ||

                        item.price ||

                        0

                    );


                const quantity =

                    Number(

                        item.quantity ||

                        0

                    );


                return (

                    total +

                    price *

                    quantity

                );

            },

            0

        );


    // =================================================
    // SHIPPING FEE
    // =================================================

    const shippingFee =

        subtotal >= 1000000

            ? 0

            : 30000;


    // =================================================
    // APPLY VOUCHER
    // =================================================

    const handleApplyVoucher = () => {


        const code =

            voucher

                .trim()

                .toUpperCase();


        // =============================================
        // EMPTY VOUCHER
        // =============================================

        if (

            !code

        ) {


            setDiscount(

                0

            );


            setVoucherApplied(

                false

            );


            setVoucherMessage(

                "Please enter a voucher code."

            );


            return;

        }


        // =============================================
        // WELCOME10
        // =============================================

        if (

            code ===

            "WELCOME10"

        ) {


            if (

                subtotal <

                500000

            ) {


                setDiscount(

                    0

                );


                setVoucherApplied(

                    false

                );


                setVoucherMessage(

                    "Minimum order is 500.000đ."

                );


                return;

            }


            const calculatedDiscount =

                Math.min(

                    subtotal *

                    0.1,

                    200000

                );


            setDiscount(

                calculatedDiscount

            );


            setVoucherApplied(

                true

            );


            setVoucherMessage(

                ""

            );


            return;

        }


        // =============================================
        // INVALID VOUCHER
        // =============================================

        setDiscount(

            0

        );


        setVoucherApplied(

            false

        );


        setVoucherMessage(

            "Invalid voucher code."

        );

    };


    // =================================================
    // TOTAL
    // =================================================

    const total =

        subtotal +

        shippingFee -

        discount;


    // =================================================
    // PAYMENT
    // =================================================

    const handlePayment =

        async () => {


            // =========================================
            // CHECK CART
            // =========================================

            if (

                cartItems.length ===

                0

            ) {


                setError(

                    "Your cart is empty."

                );


                return;

            }


            // =========================================
            // CHECK PROFILE
            // =========================================

            if (

                !profile.full_name?.trim() ||

                !profile.phone?.trim() ||

                !profile.address?.trim()

            ) {


                setError(

                    "Please update your name, phone number and address in your profile first."

                );


                return;

            }


            try {


                setProcessing(

                    true

                );


                setError("");


                // =====================================
                // EXACT CART ITEMS
                // =====================================

                const orderItems =

                    cartItems.map(

                        (

                            item

                        ) => ({


                            // -------------------------
                            // PRODUCT
                            // -------------------------

                            product_id:

                                Number(

                                    item.product_id

                                ),


                            // -------------------------
                            // VARIANT
                            // -------------------------

                            variant_id:

                                item.variant_id

                                    ? Number(

                                        item.variant_id

                                    )

                                    : null,


                            // -------------------------
                            // QUANTITY
                            // -------------------------

                            quantity:

                                Number(

                                    item.quantity

                                ),


                            // -------------------------
                            // UNIT PRICE
                            // -------------------------

                            unit_price:

                                Number(

                                    item.final_price ||

                                    item.price ||

                                    0

                                ),


                            // -------------------------
                            // SIZE
                            // -------------------------

                            size:

                                item.size_name ||

                                item.size ||

                                null,


                            // -------------------------
                            // COLOR
                            // -------------------------

                            color_id:

                                item.color_id

                                    ? Number(

                                        item.color_id

                                    )

                                    : null

                        })

                    );


                console.log(

                    "ORDER DATA:",

                    {

                        items:

                            orderItems,

                        fullName:

                            profile.full_name,

                        phone:

                            profile.phone,

                        address:

                            profile.address,

                        city:

                            profile.city,

                        district:

                            profile.district,

                        ward:

                            profile.ward,

                        shippingFee:

                            shippingFee,

                        discountAmount:

                            discount,

                        paymentMethod:

                            paymentMethod

                    }

                );


             // =====================================
// BANKING - PAYOS
// =====================================

if (
    paymentMethod ===
    "BANKING"
) {

    const paymentResponse =
        await createPaymentLink({

            amount:
                Math.round(total),

            description:
                "DK Fashion Order"

        });


    if (
        !paymentResponse?.checkoutUrl
    ) {

        throw new Error(
            "PayOS payment link was not created."
        );

    }


    window.location.href =
        paymentResponse.checkoutUrl;

    return;

}


// =====================================
// CREATE ORDER
// =====================================

await createOrder({

    items:
        orderItems,

    fullName:
        profile.full_name,

    phone:
        profile.phone,

    address:
        profile.address,

    city:
        profile.city,

    district:
        profile.district,

    ward:
        profile.ward,

    shippingFee:
        shippingFee,

    discountAmount:
        discount,

    paymentMethod:
        paymentMethod

});


                // =====================================
                // SUCCESS
                // =====================================

                alert(

                    "Order placed successfully!"

                );


                navigate(

                    "/orders"

                );

            }


            catch (

                err

            ) {


                console.error(

                    "PAYMENT ERROR:",

                    err

                );


                setError(

                    err.response?.data?.message ||

                    err.message ||

                    "Payment failed."

                );

            }


            finally {


                setProcessing(

                    false

                );

            }

        };


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


                        Loading checkout...


                    </p>


                </div>


            </main>

        );

    }


    // =================================================
    // EMPTY CART
    // =================================================

    if (

        cartItems.length ===

        0

    ) {


        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-5">


                <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">


                    <FaShoppingBag

                        className="text-5xl text-gray-300 mx-auto mb-6"

                    />


                    <h1 className="text-2xl font-bold mb-3">


                        Your cart is empty


                    </h1>


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


            </main>

        );

    }


    // =================================================
    // PAGE
    // =================================================

    return (

        <main className="min-h-screen bg-[#f8f8f6] py-10 sm:py-16">


            <div className="max-w-7xl mx-auto px-5 sm:px-8">


                {/* =====================================
                    BACK
                ====================================== */}

                <button

                    type="button"

                    onClick={() =>

                        navigate(

                            "/cart"

                        )

                    }

                    className="flex items-center gap-3 text-gray-500 hover:text-black mb-8"

                >


                    <FaArrowLeft />


                    Back to Cart


                </button>


                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="mb-10">


                    <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">


                        Complete Your Order


                    </p>


                    <h1 className="text-4xl sm:text-5xl font-bold">


                        Checkout


                    </h1>


                </div>


                {/* =====================================
                    ERROR
                ====================================== */}

                {error && (


                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4">


                        {error}


                    </div>

                )}


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                    {/* =================================
                        LEFT
                    ================================== */}

                    <div className="lg:col-span-2 space-y-8">


                        {/* =================================
                            SHIPPING INFORMATION
                        ================================== */}

                        <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm">


                            <h2 className="text-2xl font-bold mb-7">


                                Shipping Information


                            </h2>


                            <div className="space-y-5">


                                {/* NAME */}

                                <div>


                                    <label className="text-sm font-semibold block mb-2">


                                        Full Name


                                    </label>


                                    <input

                                        type="text"

                                        value={

                                            profile.full_name

                                        }

                                        readOnly

                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 cursor-not-allowed"

                                    />


                                </div>


                                {/* PHONE */}

                                <div>


                                    <label className="text-sm font-semibold block mb-2">


                                        Phone Number


                                    </label>


                                    <input

                                        type="text"

                                        value={

                                            profile.phone

                                        }

                                        readOnly

                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 cursor-not-allowed"

                                    />


                                </div>


                                {/* ADDRESS */}

                                <div>


                                    <label className="text-sm font-semibold block mb-2">


                                        Address


                                    </label>


                                    <textarea

                                        value={

                                            profile.address

                                        }

                                        readOnly

                                        rows="4"

                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 cursor-not-allowed resize-none"

                                    />


                                </div>


                                <p className="text-sm text-gray-500">


                                    Shipping information is taken from your profile.


                                    <button

                                        type="button"

                                        onClick={() =>

                                            navigate(

                                                "/profile"

                                            )

                                        }

                                        className="ml-1 underline text-black"

                                    >


                                        Edit profile


                                    </button>


                                </p>


                            </div>


                        </section>


                        {/* =================================
                            PAYMENT METHOD
                        ================================== */}

                        <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm">


                            <h2 className="text-2xl font-bold mb-6">


                                Payment Method


                            </h2>


                            <div className="space-y-4">


                                {/* COD */}

                                <label className="flex items-center gap-4 border border-gray-200 rounded-xl p-5 cursor-pointer">


                                    <input

                                        type="radio"

                                        value="COD"

                                        checked={

                                            paymentMethod ===

                                            "COD"

                                        }

                                        onChange={(event) =>

                                            setPaymentMethod(

                                                event.target.value

                                            )

                                        }

                                    />


                                    <div>


                                        <p className="font-bold">


                                            Cash on Delivery


                                        </p>


                                        <p className="text-sm text-gray-500">


                                            Pay when your order arrives.


                                        </p>


                                    </div>


                                </label>


                                {/* BANKING */}

                                <label className="flex items-center gap-4 border border-gray-200 rounded-xl p-5 cursor-pointer">


                                    <input

                                        type="radio"

                                        value="BANKING"

                                        checked={

                                            paymentMethod ===

                                            "BANKING"

                                        }

                                        onChange={(event) =>

                                            setPaymentMethod(

                                                event.target.value

                                            )

                                        }

                                    />


                                    <div>


                                        <p className="font-bold">


                                            Bank Transfer


                                        </p>


                                        <p className="text-sm text-gray-500">


                                            Transfer payment to our bank account.


                                        </p>


                                    </div>


                                </label>


                            </div>


                        </section>


                        {/* =================================
                            PRODUCTS
                        ================================== */}

                        <section className="bg-white rounded-[2rem] p-7 sm:p-8 shadow-sm">


                            <h2 className="text-2xl font-bold mb-7">


                                Your Products


                            </h2>


                            <div className="space-y-6">


                                {cartItems.map(

                                    (

                                        item

                                    ) => (


                                        <div

                                            key={

                                                item.id

                                            }

                                            className="flex gap-5 border-b border-gray-100 pb-6 last:border-0 last:pb-0"

                                        >


                                            {/* IMAGE */}

                                            <div className="w-24 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">


                                                <img

                                                    src={getImageUrl(

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


                                            {/* INFO */}

                                            <div className="flex-1">


                                                <h3 className="font-bold text-lg">


                                                    {item.product_name}


                                                </h3>


                                                {item.color_name && (


                                                    <p className="text-sm text-gray-500 mt-2">


                                                        Color:{" "}

                                                        {item.color_name}


                                                    </p>

                                                )}


                                                {(

                                                    item.size_name ||

                                                    item.size

                                                ) && (


                                                    <p className="text-sm text-gray-500">


                                                        Size:{" "}

                                                        {item.size_name ||

                                                            item.size}


                                                    </p>

                                                )}


                                                <p className="text-sm text-gray-500">


                                                    Quantity:{" "}

                                                    {item.quantity}


                                                </p>


                                                <p className="text-sm text-gray-500 mt-1">


                                                    Unit Price:{" "}

                                                    {formatMoney(

                                                        item.final_price ||

                                                        item.price

                                                    )}


                                                </p>


                                            </div>


                                            {/* PRICE */}

                                            <div className="text-right">


                                                <p className="font-bold">


                                                    {formatMoney(

                                                        Number(

                                                            item.final_price ||

                                                            item.price ||

                                                            0

                                                        ) *

                                                        Number(

                                                            item.quantity ||

                                                            0

                                                        )

                                                    )}


                                                </p>


                                            </div>


                                        </div>

                                    )

                                )}

                            </div>


                        </section>


                    </div>


                    {/* =================================
                        RIGHT SUMMARY
                    ================================== */}

                    <div className="bg-white rounded-[2rem] p-7 sm:p-8 h-fit shadow-sm lg:sticky lg:top-8">


                        <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">


                            Summary


                        </p>


                        <h2 className="text-2xl font-bold mb-8">


                            Order Summary


                        </h2>


                        {/* SUBTOTAL */}

                        <div className="flex justify-between mb-5">


                            <span className="text-gray-600">


                                Subtotal


                            </span>


                            <strong>


                                {formatMoney(

                                    subtotal

                                )}


                            </strong>


                        </div>


                        {/* SHIPPING */}

                        <div className="flex justify-between mb-5">


                            <span className="text-gray-600">


                                Shipping


                            </span>


                            <strong>


                                {shippingFee ===

                                    0

                                    ? "FREE"

                                    : formatMoney(

                                        shippingFee

                                    )

                                }


                            </strong>


                        </div>


                        {/* VOUCHER */}

                        <div className="border-t border-gray-100 pt-5">


                            <p className="font-medium mb-3">


                                Voucher


                            </p>


                            <div className="flex gap-2">


                                <input

                                    value={

                                        voucher

                                    }

                                    onChange={(event) => {


                                        setVoucher(

                                            event.target.value

                                        );


                                        setDiscount(

                                            0

                                        );


                                        setVoucherApplied(

                                            false

                                        );


                                        setVoucherMessage(

                                            ""

                                        );

                                    }}

                                    placeholder="Enter voucher code"

                                    className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black"

                                />


                                <button

                                    type="button"

                                    onClick={

                                        handleApplyVoucher

                                    }

                                    className="bg-black text-white px-5 rounded-xl font-medium"

                                >


                                    Apply


                                </button>


                            </div>


                            {voucherApplied && (


                                <p className="text-green-600 text-sm mt-3 flex items-center gap-2">


                                    <FaCheck />


                                    Voucher applied


                                </p>

                            )}


                            {voucherMessage && (


                                <p className="text-red-500 text-sm mt-3">


                                    {voucherMessage}


                                </p>

                            )}


                        </div>


                        {/* DISCOUNT */}

                        {discount >

                            0 && (


                            <div className="flex justify-between mt-5 text-green-600">


                                <span>


                                    Discount


                                </span>


                                <strong>


                                    -


                                    {formatMoney(

                                        discount

                                    )}


                                </strong>


                            </div>

                        )}


                        {/* TOTAL */}

                        <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between text-xl font-bold">


                            <span>


                                Total


                            </span>


                            <span>


                                {formatMoney(

                                    total

                                )}


                            </span>


                        </div>


                        {/* PAY */}

                        <button

                            type="button"

                            onClick={

                                handlePayment

                            }

                            disabled={

                                processing

                            }

                            className="w-full mt-8 bg-black text-white py-5 rounded-full font-bold tracking-[1px] hover:bg-gray-800 disabled:opacity-50"

                        >


                            {processing

                                ? "PROCESSING..."

                                : "PLACE ORDER"

                            }


                        </button>


                        <p className="text-xs text-gray-400 text-center mt-4">


                            Your order will be created after payment.


                        </p>


                    </div>


                </div>


            </div>


        </main>

    );

}


export default Checkout;