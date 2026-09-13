import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    createOrder
} from "../../services/checkoutService";

import {
    confirmPayment
} from "../../services/paymentService";


function PaymentSuccess() {

    const navigate =
        useNavigate();


    const [
        searchParams
    ] = useSearchParams();


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    useEffect(() => {

        const finishPayment =
            async () => {

                try {

                    // =====================================
                    // GET PAYOS ORDER CODE
                    // =====================================

                    const orderCode =
                        searchParams.get(
                            "orderCode"
                        );


                    if (
                        !orderCode
                    ) {

                        throw new Error(
                            "Payment order code is missing."
                        );

                    }


                    // =====================================
                    // CONFIRM PAYMENT
                    // =====================================

                    const paymentResult =
                        await confirmPayment(
                            orderCode
                        );


                    if (
                        !paymentResult?.paid
                    ) {

                        throw new Error(
                            "Payment has not been completed."
                        );

                    }


                    // =====================================
                    // GET PENDING ORDER
                    // =====================================

                    const pendingOrder =
                        localStorage.getItem(
                            "pendingOrder"
                        );


                    if (
                        !pendingOrder
                    ) {

                        throw new Error(
                            "Pending order information is missing."
                        );

                    }


                    const orderData =
                        JSON.parse(
                            pendingOrder
                        );


                    // =====================================
                    // CREATE ORDER
                    // =====================================

                    await createOrder(
                        orderData
                    );


                    // =====================================
                    // REMOVE PENDING ORDER
                    // =====================================

                    localStorage.removeItem(
                        "pendingOrder"
                    );


                    // =====================================
                    // GO ORDERS
                    // =====================================

                    navigate(
                        "/orders",
                        {
                            replace: true
                        }
                    );

                }

                catch (err) {

                    console.error(
                        "PAYMENT SUCCESS ERROR:",
                        err
                    );


                    setError(

                        err.response?.data?.message ||

                        err.message ||

                        "Payment confirmation failed."

                    );

                }

                finally {

                    setLoading(
                        false
                    );

                }

            };


        finishPayment();

    }, [
        navigate,
        searchParams
    ]);


    if (
        loading
    ) {

        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">

                <div className="text-center">

                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />

                    <h1 className="text-2xl font-bold">

                        Confirming Payment...

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Please wait.

                    </p>

                </div>

            </main>

        );

    }


    if (
        error
    ) {

        return (

            <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-5">

                <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm max-w-md">

                    <h1 className="text-2xl font-bold text-red-600">

                        Payment Confirmation Failed

                    </h1>

                    <p className="text-gray-500 mt-4">

                        {error}

                    </p>


                    <button

                        onClick={() =>
                            navigate("/orders")
                        }

                        className="mt-6 bg-black text-white px-8 py-3 rounded-full"

                    >

                        GO TO ORDERS

                    </button>

                </div>

            </main>

        );

    }


    return null;

}


export default PaymentSuccess;