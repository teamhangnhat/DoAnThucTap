import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
    getHeroStatistics,
    getWebsiteSettings
} from "../../services/homeService";

import {
    FaInstagram,
    FaFacebookF,
    FaTiktok
} from "react-icons/fa";

// Home Components
import FeaturedProducts from "../../components/home/FeaturedProducts";
import Categories from "../../components/home/Categories";
import BestSeller from "../../components/home/BestSeller";
import Lookbook from "../../components/home/Lookbook";
import WhyChoose from "../../components/home/WhyChoose";
import SaleBanner from "../../components/home/SaleBanner";


// ================= FORMAT NUMBER =================

const formatNumber = (number) => {

    if (!number) return "0";

    if (number >= 1000000) {

        return `${(number / 1000000).toFixed(1)}M+`;

    }

    if (number >= 1000) {

        return `${Math.floor(number / 1000)}K+`;

    }

    return `${number}+`;

};


// ================= HOME =================

function Home() {

    const [statistics, setStatistics] = useState({

        visitors: 0,
        reviews: 0,
        customers: 0,
        products: 0

    });

    const [settings, setSettings] = useState({

        logo_url: null,
        site_name: "DK CLOTHING"

    });

    const [loading, setLoading] = useState(true);


    // ================= LOAD DATA =================

    useEffect(() => {

        const loadHomeData = async () => {

            try {

                const [statisticsData, settingsData] =
                    await Promise.all([

                        getHeroStatistics(),

                        getWebsiteSettings()

                    ]);


                setStatistics(statisticsData);

                setSettings(settingsData);


            } catch (error) {

                console.error(
                    "Failed to load home data:",
                    error
                );


            } finally {

                setLoading(false);

            }

        };


        loadHomeData();

    }, []);


    // ================= LOGO =================

    const logoUrl = settings.logo_url

        ? `http://localhost:5000${settings.logo_url}`

        : null;


    return (

        <>


            {/* ================================================= */}
            {/* ================= HERO ========================== */}
            {/* ================================================= */}

            <section className="relative h-screen overflow-hidden">


                {/* HERO BACKGROUND */}

               <img
    src="http://localhost:5000/uploads/banner/hero1.png"
    alt="DK Clothing Hero"
    className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
    "
/>


                {/* OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent"></div>


                {/* SOCIAL ICONS */}

                <div className="hidden xl:flex flex-col gap-8 absolute left-10 top-1/2 -translate-y-1/2 z-20">


                    <FaInstagram

                        className="text-white text-xl hover:scale-110 hover:text-gray-300 duration-300 cursor-pointer"

                    />


                    <FaFacebookF

                        className="text-white text-xl hover:scale-110 hover:text-gray-300 duration-300 cursor-pointer"

                    />


                    <FaTiktok

                        className="text-white text-xl hover:scale-110 hover:text-gray-300 duration-300 cursor-pointer"

                    />


                </div>


                {/* CONTENT */}

                <div className="relative z-10 h-full flex items-center">


                    <div className="max-w-7xl mx-auto w-full px-6 lg:px-10">


                        <motion.div

                            initial={{

                                opacity: 0,

                                y: 60

                            }}

                            animate={{

                                opacity: 1,

                                y: 0

                            }}

                            transition={{

                                duration: 1

                            }}

                            className="max-w-2xl"

                        >


                            {/* TITLE */}

                            <p className="uppercase tracking-[10px] text-white text-sm mb-6">

                                {settings.site_name} • NEW COLLECTION

                            </p>


                            <h1 className="text-white text-6xl lg:text-8xl font-black leading-tight">

                                Discover

                                <br />

                                Your Style

                            </h1>


                            <p className="text-gray-200 text-lg leading-8 mt-8 max-w-xl">

                                Premium fashion crafted with timeless elegance,

                                luxurious fabrics and everyday comfort.

                            </p>


                            {/* SHOP BUTTON */}

                            <Link

                                to="/products"

                                className="inline-block mt-10 bg-white text-black px-10 py-4 rounded-full font-semibold hover:bg-black hover:text-white duration-300"

                            >

                                SHOP NOW

                            </Link>


                            {/* RATING */}

                            <div className="flex items-center gap-4 mt-10">


                                <span className="text-yellow-400 text-xl">

                                    ★★★★★

                                </span>


                                <p className="text-gray-200">

                                    Trusted by


                                    <span className="font-bold text-white">

                                        {" "}

                                        {formatNumber(statistics.customers)}

                                    </span>


                                    {" "}customers

                                </p>


                            </div>


                            {/* STATISTICS */}

                            <div className="flex flex-wrap gap-12 mt-12">


                                {/* VISITORS */}

                                <div>


                                    <h3 className="text-4xl text-white font-bold">


                                        {formatNumber(

                                            statistics.visitors

                                        )}


                                    </h3>


                                    <p className="text-gray-300">

                                        Visitors

                                    </p>


                                </div>


                                {/* REVIEWS */}

                                <div>


                                    <h3 className="text-4xl text-white font-bold">


                                        {formatNumber(

                                            statistics.reviews

                                        )}


                                    </h3>


                                    <p className="text-gray-300">

                                        Reviews

                                    </p>


                                </div>


                                {/* PRODUCTS */}

                                <div>


                                    <h3 className="text-4xl text-white font-bold">


                                        {formatNumber(

                                            statistics.products

                                        )}


                                    </h3>


                                    <p className="text-gray-300">

                                        Products

                                    </p>


                                </div>


                            </div>


                        </motion.div>


                    </div>


                </div>


                {/* SCROLL */}

                <motion.div

                    animate={{

                        y: [0, 10, 0]

                    }}

                    transition={{

                        repeat: Infinity,

                        duration: 2

                    }}

                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white"

                >

                    <p className="tracking-[5px] text-xs">

                        SCROLL

                    </p>


                    <span className="text-3xl">

                        ↓

                    </span>


                </motion.div>


            </section>


            {/* ================================================= */}
            {/* ================= NEW ARRIVALS ================== */}
            {/* ================================================= */}

            <section className="bg-white py-28">


                <FeaturedProducts />


            </section>


            {/* DIVIDER */}

            <div className="max-w-7xl mx-auto">

                <div className="border-b border-gray-200"></div>

            </div>


            {/* ================================================= */}
            {/* ================= CATEGORIES ==================== */}
            {/* ================================================= */}

            <section className="bg-[#faf9f7] py-28">


                <Categories />


            </section>


            {/* DIVIDER */}

            <div className="max-w-7xl mx-auto">

                <div className="border-b border-gray-200"></div>

            </div>


            {/* ================================================= */}
            {/* ================= BEST SELLER ================== */}
            {/* ================================================= */}

            <section className="bg-white py-32">


                <BestSeller />


            </section>


            {/* ================================================= */}
            {/* ================= LOOKBOOK ====================== */}
            {/* ================================================= */}

            <Lookbook />


            {/* ================================================= */}
            {/* ================= SALE EVENT ==================== */}
            {/* ================================================= */}

            <section className="bg-white py-28">


                <SaleBanner />


            </section>


            {/* DIVIDER */}

            <div className="max-w-7xl mx-auto">

                <div className="border-b border-gray-200"></div>

            </div>


            {/* ================================================= */}
            {/* ================= WHY CHOOSE ==================== */}
            {/* ================================================= */}

            <section className="bg-[#faf9f7] py-28">


                <WhyChoose />


            </section>


        </>

    );

}


export default Home;