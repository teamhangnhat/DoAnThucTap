import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getBestSeller } from "../../services/productService";

const API_URL = "http://localhost:5000";

function BestSeller() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        loadBestSeller();

    }, []);

    const loadBestSeller = async () => {

        try {

            const res = await getBestSeller();

            console.log("BEST SELLER:", res.data);

            setProducts(res.data);

        }

        catch (err) {

            console.error(
                "Failed to load best sellers:",
                err
            );

        }

    };

    if (products.length === 0) {

        return null;

    }

    const main = products[0];

    return (

        <section className="max-w-7xl mx-auto px-6">

            {/* ================= TITLE ================= */}

            <div className="text-center mb-20">

                <p className="uppercase tracking-[8px] text-gray-400">

                    BEST SELLER

                </p>

                <h2 className="text-5xl font-black mt-4">

                    Customer Favorites

                </h2>

                <p className="text-gray-500 mt-5 text-lg">

                    Discover the products most loved by our customers.

                </p>

            </div>


            {/* ================= CONTENT ================= */}

            <div className="grid lg:grid-cols-2 gap-10">


                {/* ================= #1 BEST SELLER ================= */}

                <Link

                    to={`/products/detail/${main.id}`}

                    className="group"

                >

                    <div className="relative overflow-hidden rounded-3xl">

                        <img

                            src={`${API_URL}${main.image_url}`}

                            alt={main.product_name}

                            className="
                                w-full
                                h-[700px]
                                object-cover
                                duration-500
                                group-hover:scale-105
                            "

                            onError={(e) => {

                                console.log(
                                    "Image error:",
                                    `${API_URL}${main.image_url}`
                                );

                            }}

                        />


                        {/* BADGE */}

                        <span

                            className="
                                absolute
                                top-6
                                left-6
                                bg-red-600
                                text-white
                                px-5
                                py-2
                                rounded-full
                                text-sm
                                font-semibold
                            "

                        >

                            🔥 #1 BEST SELLER

                        </span>


                        {/* OVERLAY */}

                        <div

                            className="
                                absolute
                                bottom-0
                                w-full
                                bg-gradient-to-t
                                from-black/80
                                via-black/40
                                to-transparent
                                p-8
                            "

                        >

                            <p

                                className="
                                    uppercase
                                    tracking-[4px]
                                    text-white
                                "

                            >

                                {main.category_name}

                            </p>


                            <h3

                                className="
                                    text-white
                                    text-3xl
                                    font-bold
                                    mt-3
                                "

                            >

                                {main.product_name}

                            </h3>


                            <p

                                className="
                                    text-white
                                    text-2xl
                                    mt-4
                                "

                            >

                                {Number(main.price).toLocaleString()}đ

                            </p>


                            <button

                                className="
                                    mt-8
                                    bg-white
                                    text-black
                                    px-8
                                    py-3
                                    rounded-full
                                    font-semibold
                                    hover:bg-black
                                    hover:text-white
                                    duration-300
                                "

                            >

                                SHOP NOW

                            </button>

                        </div>

                    </div>

                </Link>


                {/* ================= OTHER BEST SELLERS ================= */}

                <div className="grid gap-8">

                    {products.slice(1).map((item, index) => (

                        <Link

                            key={item.id}

                            to={`/products/detail/${item.id}`}

                            className="
                                group
                                flex
                                gap-6
                                items-center
                            "

                        >

                            {/* IMAGE */}

                            <div

                                className="
                                    relative
                                    overflow-hidden
                                    rounded-2xl
                                    flex-shrink-0
                                "

                            >

                                <img

                                    src={`${API_URL}${item.image_url}`}

                                    alt={item.product_name}

                                    className="
                                        w-56
                                        h-56
                                        object-cover
                                        duration-500
                                        group-hover:scale-105
                                    "

                                />


                                {/* RANK */}

                                <span

                                    className="
                                        absolute
                                        top-3
                                        left-3
                                        bg-black
                                        text-white
                                        w-10
                                        h-10
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        font-bold
                                    "

                                >

                                    {index + 2}

                                </span>

                            </div>


                            {/* INFO */}

                            <div>

                                <p

                                    className="
                                        uppercase
                                        tracking-[3px]
                                        text-xs
                                        text-gray-400
                                    "

                                >

                                    {item.category_name}

                                </p>


                                <h3

                                    className="
                                        text-2xl
                                        font-bold
                                        mt-3
                                    "

                                >

                                    {item.product_name}

                                </h3>


                                <p

                                    className="
                                        text-gray-500
                                        mt-3
                                    "

                                >

                                    Premium quality fashion crafted
                                    for everyday elegance.

                                </p>


                                <p

                                    className="
                                        text-2xl
                                        font-bold
                                        mt-4
                                    "

                                >

                                    {Number(
                                        item.price
                                    ).toLocaleString()}đ

                                </p>

                            </div>

                        </Link>

                    ))}

                </div>

            </div>


            {/* ================= VIEW ALL ================= */}

            <div className="flex justify-center mt-20">

                <Link

                    to="/products"

                    className="
                        border
                        border-black
                        px-10
                        py-4
                        rounded-full
                        font-semibold
                        hover:bg-black
                        hover:text-white
                        duration-300
                    "

                >

                    VIEW ALL BEST SELLERS

                </Link>

            </div>

        </section>

    );

}

export default BestSeller;