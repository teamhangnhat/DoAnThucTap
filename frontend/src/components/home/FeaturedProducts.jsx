import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../../services/productService";
import ProductCard from "../product/ProductCard";


function FeaturedProducts() {


    const [products, setProducts] = useState([]);


    useEffect(() => {


        loadFeaturedProducts();


    }, []);


    const loadFeaturedProducts = async () => {


        try {


            /*
             * Lấy toàn bộ sản phẩm
             *
             * Backend đã sắp xếp:
             *
             * created_at DESC
             *
             * nên sản phẩm mới nhất nằm đầu tiên
             */


            const res = await getProducts();


            /*
             * Home chỉ hiển thị 4 sản phẩm mới nhất
             */


            setProducts(

                (res.data || []).slice(0, 4)

            );


        }


        catch (err) {


            console.log(

                "Load New Arrivals Error:",

                err

            );


        }


    };


    return (

        <section className="max-w-7xl mx-auto py-24 px-6">


            {/* TITLE */}


            <div className="flex justify-between items-end mb-16">


                <div>


                    <p className="uppercase tracking-[6px] text-gray-500">


                        Featured Collection


                    </p>


                    <h2 className="text-5xl font-bold mt-4">


                        New Arrivals


                    </h2>


                    <p className="text-gray-500 mt-4 max-w-xl">


                        Discover our newest arrivals crafted with premium
                        materials and timeless elegance.


                    </p>


                </div>


                <Link


                    to="/products"


                    className="

                        hidden

                        md:inline-flex

                        border

                        border-black

                        px-8

                        py-3

                        rounded-full

                        font-semibold

                        hover:bg-black

                        hover:text-white

                        duration-300

                    "


                >


                    View All →


                </Link>


            </div>


            {/* PRODUCTS */}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


                {products.map(product => (


                    <ProductCard


                        key={product.id}


                        product={product}


                    />


                ))}


            </div>


            {/* MOBILE BUTTON */}


            <div className="flex justify-center mt-12 md:hidden">


                <Link


                    to="/products"


                    className="

                        border

                        border-black

                        px-8

                        py-3

                        rounded-full

                        font-semibold

                        hover:bg-black

                        hover:text-white

                        duration-300

                    "


                >


                    View All


                </Link>


            </div>


        </section>

    );

}


export default FeaturedProducts;