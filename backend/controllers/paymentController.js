const payOS = require("../config/payos");

// =====================================================
// CREATE PAYMENT LINK
// =====================================================

const createPaymentLink = async (req, res) => {

    try {

        const {
            amount,
            description
        } = req.body;


        if (
            !amount ||
            Number(amount) <= 0
        ) {

            return res.status(400).json({
                message: "Invalid payment amount."
            });

        }


        const orderCode =
            Number(
                Date.now()
                    .toString()
                    .slice(-9)
            );


        const paymentData = {

            orderCode,

            amount:
                Number(amount),

            description:
                description ||
                "DK Fashion Order",

            items: [

                {

                    name:
                        "DK Fashion Order",

                    quantity:
                        1,

                    price:
                        Number(amount)

                }

            ],

            returnUrl:
                process.env.PAYOS_RETURN_URL,

            cancelUrl:
                process.env.PAYOS_CANCEL_URL

        };


        const paymentLink =
            await payOS.paymentRequests.create(
                paymentData
            );


        return res.json({

            success: true,

            orderCode,

            checkoutUrl:
                paymentLink.checkoutUrl,

            qrCode:
                paymentLink.qrCode

        });

    }

    catch (err) {

        console.error(
            "PAYOS ERROR:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message ||
                "Failed to create PayOS payment."

        });

    }

};


// =====================================================
// CONFIRM PAYMENT
// =====================================================

const confirmPayment = async (req, res) => {

    try {

        const orderCode =
            Number(
                req.params.orderCode
            );


        if (
            !orderCode
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order code."

            });

        }


        const payment =
            await payOS.paymentRequests.get(
                orderCode
            );


        console.log(
            "PAYOS PAYMENT STATUS:",
            payment.status
        );


        if (
            payment.status !==
            "PAID"
        ) {

            return res.json({

                success: true,

                paid: false

            });

        }


        return res.json({

            success: true,

            paid: true

        });

    }

    catch (err) {

        console.error(
            "CONFIRM PAYOS ERROR:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message ||
                "Failed to confirm PayOS payment."

        });

    }

};


module.exports = {

    createPaymentLink,

    confirmPayment

};