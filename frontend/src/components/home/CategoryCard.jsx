import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function CategoryCard({ image, title, subtitle, link }) {

    return (

        <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.35 }}
            className="group relative overflow-hidden rounded-3xl shadow-lg"
        >

            <Link to={link}>

                <img
                    src={image}
                    alt={title}
                    className="w-full h-[520px] object-cover duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute bottom-10 left-8 right-8">

                    <h2 className="text-white text-4xl font-bold">
                        {title}
                    </h2>

                    <p className="text-gray-200 mt-3">
                        {subtitle}
                    </p>

                    <span
                        className="
                            inline-block
                            mt-6
                            border
                            border-white
                            px-7
                            py-3
                            text-white
                            rounded-full
                            opacity-0
                            translate-y-5
                            group-hover:opacity-100
                            group-hover:translate-y-0
                            duration-500
                        "
                    >
                        SHOP NOW
                    </span>

                </div>

            </Link>

        </motion.div>

    );
}

export default CategoryCard;