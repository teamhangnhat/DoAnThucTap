import { useEffect, useState } from "react";

import {
    NavLink,
    useParams,
    useLocation
} from "react-router-dom";


import ProductBanner
    from "../../components/product/ProductBanner";


import ProductToolbar
    from "../../components/product/ProductToolbar";


import ProductGrid
    from "../../components/product/ProductGrid";


import Pagination
    from "../../components/product/Pagination";


import { getProducts }
    from "../../services/productService";


import { getCategories }
    from "../../services/categoryService";


function createSlug(name) {


    return name

        .toLowerCase()

        .trim()

        .replace(/\s+/g, "-");

}


function Product() {


    const {

        category,

        subcategory

    } = useParams();


    const location = useLocation();


    const [products, setProducts] = useState([]);


    const [categoryData, setCategoryData] = useState(null);


    const [loading, setLoading] = useState(true);


    const [search, setSearch] = useState("");


    const [sort, setSort] = useState("newest");


    const [currentPage, setCurrentPage] = useState(1);


    const pageSize = 8;


    // ==================================================
    // LOAD CATEGORY FROM SQL
    // ==================================================


    useEffect(() => {


        let isMounted = true;


        const loadCategoryData = async () => {


            if (

                !category ||

                location.pathname === "/products/sale"

            ) {


                if (isMounted) {

                    setCategoryData(null);

                }


                return;

            }


            try {


                const res = await getCategories();


                const parentCategory =

                    res.data.find(

                        item =>

                            createSlug(

                                item.category_name

                            )

                            ===

                            category

                    );


                if (isMounted) {


                    setCategoryData(

                        parentCategory || null

                    );


                }


            }


            catch (error) {


                console.error(

                    "Load category error:",

                    error

                );


            }


        };


        loadCategoryData();


        return () => {

            isMounted = false;

        };


    }, [

        category,

        location.pathname

    ]);


    // ==================================================
    // LOAD PRODUCTS
    // ==================================================


    useEffect(() => {


        let isMounted = true;


        const loadProducts = async () => {


            try {


                setLoading(true);


                const params = {};


                // SEARCH


                if (

                    search.trim() !== ""

                ) {


                    params.search =

                        search.trim();


                }


                // SORT


                if (

                    sort !== "newest"

                ) {


                    params.sort = sort;


                }


                // SALE


                if (

                    location.pathname

                    === "/products/sale"

                ) {


                    params.sale = true;


                }


                // SUBCATEGORY


                else if (

                    subcategory

                ) {


                    params.subcategory =

                        subcategory;


                }


                // MAIN CATEGORY


                else if (

                    category

                ) {


                    params.category =

                        category;


                }


                const res = await getProducts(params);


                if (isMounted) {


                    setProducts(

                        res.data || []

                    );


                    setCurrentPage(1);


                }


            }


            catch (error) {


                console.error(

                    "Load products error:",

                    error

                );


                if (isMounted) {


                    setProducts([]);

                }


            }


            finally {


                if (isMounted) {


                    setLoading(false);

                }


            }


        };


        loadProducts();


        return () => {

            isMounted = false;

        };


    }, [

        category,

        subcategory,

        location.pathname,

        search,

        sort

    ]);


    // ==================================================
    // TITLE
    // ==================================================


    let pageTitle = "All Products";


    if (

        location.pathname

        === "/products/sale"

    ) {


        pageTitle =

            "Sale Collection";


    }


    else if (

        subcategory

    ) {


        pageTitle =

            `${subcategory

                .replace(/-/g, " ")

            } Collection`;


    }


    else if (

        category

    ) {


        pageTitle =

            `${category

                .replace(/-/g, " ")

            } Collection`;


    }


    // ==================================================
    // PAGINATION
    // ==================================================


    const totalPages = Math.ceil(

        products.length / pageSize

    );


    const startIndex =

        (currentPage - 1)

        * pageSize;


    const currentProducts =

        products.slice(

            startIndex,

            startIndex + pageSize

        );


    return (

        <>


            <ProductBanner />


            <section

                className="

                    max-w-7xl

                    mx-auto

                    px-6

                    py-20

                "

            >


                <ProductToolbar

                    total={products.length}

                    search={search}

                    setSearch={setSearch}

                    sort={sort}

                    setSort={setSort}

                />


                {/* =========================================
                    SUBCATEGORIES FROM SQL
                ========================================= */}


                {categoryData &&

                    categoryData.subcategories &&

                    categoryData.subcategories.length > 0 && (


                        <div

                            className="

                                flex
                                flex-wrap
                                gap-4
                                mb-12

                            "

                        >


                            {/* ALL */}


                            <NavLink

                                to={

                                    `/products/${category}`

                                }

                                className={({ isActive }) => `

                                    px-6
                                    py-3
                                    rounded-full
                                    border
                                    text-sm
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    transition-all
                                    duration-300

                                    ${
                                        isActive

                                            ?

                                            "bg-black text-white"

                                            :

                                            "text-gray-600 hover:bg-black hover:text-white"

                                    }

                                `}

                            >

                                ALL

                            </NavLink>


                            {/* SUBCATEGORIES */}


                            {categoryData.subcategories.map(

                                subcategoryItem => {


                                    const slug =

                                        createSlug(

                                            subcategoryItem

                                                .category_name

                                        );


                                    return (


                                        <NavLink

                                            key={

                                                subcategoryItem.id

                                            }

                                            to={

                                                `/products/${category}/${slug}`

                                            }

                                            className={({ isActive }) => `

                                                px-6
                                                py-3
                                                rounded-full
                                                border
                                                text-sm
                                                font-semibold
                                                uppercase
                                                tracking-wider
                                                transition-all
                                                duration-300

                                                ${
                                                    isActive

                                                        ?

                                                        "bg-black text-white"

                                                        :

                                                        "text-gray-600 hover:bg-black hover:text-white"

                                                }

                                            `}

                                        >

                                            {

                                                subcategoryItem

                                                    .category_name

                                            }

                                        </NavLink>


                                    );


                                }

                            )}


                        </div>

                    )}


                {/* =========================================
                    TITLE
                ========================================= */}


                <div

                    className="mb-12"

                >


                    <h1

                        className="

                            text-4xl

                            font-bold

                            capitalize

                        "

                    >

                        {pageTitle}

                    </h1>


                    <p

                        className="

                            text-gray-500

                            mt-3

                            max-w-2xl

                        "

                    >

                        Discover premium fashion

                        designed for everyday elegance

                        with high quality materials

                        and timeless style.

                    </p>


                </div>


                {/* =========================================
                    PRODUCT GRID
                ========================================= */}


                {currentProducts.length > 0 ? (


                    <>


                        <ProductGrid

                            products={currentProducts}

                        />


                        <Pagination

                            currentPage={currentPage}

                            totalPages={totalPages}

                            onPageChange={

                                setCurrentPage

                            }

                        />


                    </>


                )


                : loading ? (


                    <div

                        className="

                            py-40

                            text-center

                        "

                    >

                        <h2

                            className="

                                text-3xl

                                font-bold

                            "

                        >

                            Loading...

                        </h2>

                    </div>


                )


                : (


                    <div

                        className="

                            py-40

                            text-center

                        "

                    >

                        <h2

                            className="

                                text-3xl

                                font-bold

                        "

                        >

                            No Products Found

                        </h2>


                        <p

                            className="

                                text-gray-500

                                mt-4

                            "

                        >

                            Please try another

                            keyword or category.

                        </p>

                    </div>

                )}


            </section>


        </>

    );

}


export default Product;