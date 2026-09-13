import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

function SaleBanner() {

    const [sale, setSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // ================= LOAD SALE =================

    useEffect(() => {

        const loadSale = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:5000/api/home/flash-sale"
                );

                setSale(response.data);

            } catch (error) {

                console.error(
                    "Load flash sale error:",
                    error
                );

            }

        };

        loadSale();

    }, []);


    // ================= COUNTDOWN =================

    useEffect(() => {

        if (!sale) return;

        const updateCountdown = () => {

            const now = new Date();
            const end = new Date(sale.end_time);

            const difference = end - now;

            if (difference <= 0) {

                setTimeLeft(null);

                return;

            }

            const days = Math.floor(
                difference / (1000 * 60 * 60 * 24)
            );

            const hours = Math.floor(
                (difference / (1000 * 60 * 60)) % 24
            );

            const minutes = Math.floor(
                (difference / (1000 * 60)) % 60
            );

            const seconds = Math.floor(
                (difference / 1000) % 60
            );

            setTimeLeft({

                days,
                hours,
                minutes,
                seconds

            });

        };

        updateCountdown();

        const timer = setInterval(
            updateCountdown,
            1000
        );

        return () => clearInterval(timer);

    }, [sale]);


    // ================= NO ACTIVE SALE =================

    if (!sale || !timeLeft) {

        return null;

    }


    // ================= IMAGE URL =================

    const imageUrl = `http://localhost:5000/${

        sale.image_url
            .replaceAll("\\", "/")

    }`;


    return (

        <>

            {/* ================= TITLE ================= */}

            <section className="bg-white pt-28 pb-16">

                <div className="max-w-7xl mx-auto px-6 text-center">

                    <motion.div

                        initial={{
                            opacity: 0,
                            y: 40
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        viewport={{
                            once: true
                        }}

                        transition={{
                            duration: 0.7
                        }}

                    >

                        <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-5 py-2 rounded-full font-semibold text-sm">

                            🔥 Limited Time Offer

                        </div>


                        <p className="uppercase tracking-[8px] text-gray-400 text-sm mt-6">

                            SPECIAL OFFERS

                        </p>


                        <h2 className="text-5xl lg:text-6xl font-black mt-4">

                            {sale.title}

                        </h2>


                        <p className="text-gray-500 mt-6 max-w-2xl mx-auto leading-8">

                            {sale.description}

                        </p>

                    </motion.div>

                </div>

            </section>


            {/* ================= SALE BANNER ================= */}

            <section className="relative h-[700px] overflow-hidden">

                <img

                    src={imageUrl}

                    alt={sale.title}

                    className="w-full h-full object-cover"

                />


                <div className="absolute inset-0 bg-black/55"></div>


                <div className="absolute inset-0 flex items-center justify-center">

                    <motion.div

                        initial={{
                            opacity: 0,
                            y: 60
                        }}

                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}

                        transition={{
                            duration: 0.8
                        }}

                        viewport={{
                            once: true
                        }}

                        className="text-center px-6 max-w-4xl"

                    >

                        <p className="uppercase tracking-[10px] text-white text-sm">

                            LIMITED TIME ONLY

                        </p>


                        <h2 className="text-white text-6xl lg:text-8xl font-black mt-8 leading-tight">

                            {sale.title}

                        </h2>


                        <p className="text-gray-200 text-lg mt-8 leading-8 max-w-2xl mx-auto">

                            {sale.description}

                        </p>


                        {/* DISCOUNT */}

                        <p className="text-white text-2xl font-bold mt-6">

                            UP TO {sale.discount_percent}% OFF

                        </p>


                        {/* COUNTDOWN */}

                        <div className="flex justify-center gap-6 mt-12">

                            <CountdownBox
                                value={timeLeft.days}
                                label="Days"
                            />

                            <CountdownBox
                                value={timeLeft.hours}
                                label="Hours"
                            />

                            <CountdownBox
                                value={timeLeft.minutes}
                                label="Minutes"
                            />

                            <CountdownBox
                                value={timeLeft.seconds}
                                label="Seconds"
                            />

                        </div>


                        <Link

                            to="/products/sale"

                            className="inline-block mt-12 border-2 border-white text-white px-12 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300"

                        >

                            {sale.button_text}

                        </Link>

                    </motion.div>

                </div>

            </section>

        </>

    );

}


function CountdownBox({

    value,
    label

}) {

    return (

        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center">

            <h3 className="text-white text-4xl font-bold">

                {String(value).padStart(2, "0")}

            </h3>


            <p className="text-gray-300 text-sm">

                {label}

            </p>

        </div>

    );

}


export default SaleBanner;