import { useEffect } from "react";

import {
    useNavigate
} from "react-router-dom";


function PaymentCancel() {

    const navigate =
        useNavigate();


    useEffect(() => {

        const timer =
            setTimeout(() => {

                navigate(
                    "/",
                    {
                        replace: true
                    }
                );

            }, 1500);


        return () => {

            clearTimeout(timer);

        };

    }, [
        navigate
    ]);


    return (

        <main className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-5">

            <div className="bg-white rounded-[2rem] shadow-sm p-10 text-center max-w-md w-full">

                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">

                    <span className="text-2xl">
                        ×
                    </span>

                </div>


                <h1 className="text-2xl font-bold mb-3">

                    Payment Cancelled

                </h1>


                <p className="text-gray-500">

                    Your payment was cancelled.

                    <br />

                    Returning to home page...

                </p>

            </div>

        </main>

    );

}


export default PaymentCancel;