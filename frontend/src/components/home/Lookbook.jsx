import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import lookbook from "../../assets/images/lookbook.png";

function Lookbook() {

    return (

        <section className="relative h-[80vh] overflow-hidden">

            {/* Background */}

            <img
                src={lookbook}
                alt="Lookbook"
                className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                "
            />

            {/* Overlay */}

            <div className="absolute inset-0 bg-black/45"></div>

            {/* Content */}

            <div className="relative z-10 h-full flex items-center justify-center">

                <motion.div

                    initial={{ opacity: 0, y: 60 }}

                    whileInView={{ opacity: 1, y: 0 }}

                    transition={{ duration: 1 }}

                    viewport={{ once: true }}

                    className="text-center text-white px-6"

                >

                    <p className="uppercase tracking-[8px] text-sm">

                        NEW SEASON 2026

                    </p>

                    <h2 className="text-5xl lg:text-7xl font-black mt-6 leading-tight">

                        Dress Beyond
                        <br />
                        Trends

                    </h2>

                    <p className="mt-8 max-w-xl mx-auto text-gray-200 leading-8">

                        Discover timeless pieces crafted with premium
                        materials, designed to elevate your everyday style.

                    </p>

                    <Link

                        to="/products"

                        className="
                            inline-block
                            mt-10
                            px-10
                            py-4
                            border
                            border-white
                            rounded-full
                            font-semibold
                            hover:bg-white
                            hover:text-black
                            duration-300
                        "

                    >

                        SHOP COLLECTION

                    </Link>

                </motion.div>

            </div>

        </section>

    );

}

export default Lookbook;