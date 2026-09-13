import {

    useEffect,

    useState

} from "react";


import {

    Link,

    useNavigate

} from "react-router-dom";


import {

    FaHeart,

    FaShoppingBag

} from "react-icons/fa";


import {

    getWishlist,

    addToWishlist,

    removeFromWishlist

} from "../../services/wishlistService";



function ProductCard({ product }) {


    const navigate = useNavigate();


    // =================================================
    // WISHLIST STATE
    // =================================================

    const [

        isWishlisted,

        setIsWishlisted

    ] = useState(false);


    const [

        wishlistLoading,

        setWishlistLoading

    ] = useState(false);



    // =================================================
    // CHECK WISHLIST FROM DATABASE
    // =================================================

    useEffect(() => {


        let isMounted = true;


        const checkWishlist = async () => {


            const user = JSON.parse(

                localStorage.getItem("user")

            );


            if (!user?.id) {

                if (isMounted) {

                    setIsWishlisted(false);

                }

                return;

            }


            try {


                const response = await getWishlist(

                    user.id

                );


                if (!isMounted) {

                    return;

                }


                const wishlist = Array.isArray(

                    response.data

                )

                    ? response.data

                    : [];


                const exists = wishlist.some(

                    item =>

                        Number(item.product_id)

                        ===

                        Number(product.id)

                );


                setIsWishlisted(

                    exists

                );

            }


            catch (err) {


                console.error(

                    "CHECK WISHLIST ERROR:",

                    err

                );

            }

        };


        checkWishlist();


        return () => {

            isMounted = false;

        };


    }, [

        product.id

    ]);



    // =================================================
    // WISHLIST CLICK
    // =================================================

    const handleWishlist = async (event) => {


        event.preventDefault();

        event.stopPropagation();


        const user = JSON.parse(

            localStorage.getItem("user")

        );


        // =================================================
        // NOT LOGIN
        // =================================================

        if (!user?.id) {


            navigate("/login");


            return;

        }


        // =================================================
        // PREVENT DOUBLE CLICK
        // =================================================

        if (wishlistLoading) {


            return;

        }


        try {


            setWishlistLoading(

                true

            );


            // =================================================
            // REMOVE
            // =================================================

            if (isWishlisted) {


                await removeFromWishlist(

                    user.id,

                    product.id

                );


                setIsWishlisted(

                    false

                );

            }


            // =================================================
            // ADD
            // =================================================

            else {


                await addToWishlist({

                    customer_id:

                        Number(user.id),

                    product_id:

                        Number(product.id)

                });


                setIsWishlisted(

                    true

                );

            }

        }


        catch (err) {


            console.error(

                "WISHLIST ERROR:",

                err

            );


            alert(

                err.response?.data?.message

                ||

                "Wishlist error."

            );

        }


        finally {


            setWishlistLoading(

                false

            );

        }

    };



    // =================================================
    // PRICE
    // =================================================

    const price =

        Number(

            product.price

        ) || 0;


    const discount =

        Number(

            product.discount_percent

            ||

            0

        );


    const finalPrice =

        price *

        (100 - discount) /

        100;



    // =================================================
    // STOCK
    // =================================================

    const isOutOfStock =

        Number(

            product.stock

        ) <= 0;



    // =================================================
    // IMAGE
    // =================================================

    const imageUrl =

        product.image_url

            ? `http://localhost:5000${

                product.image_url.startsWith("/")

                    ? product.image_url

                    : `/${product.image_url}`

            }`

            : "/placeholder.png";



    return (

        <div

            className={`

                group

                bg-white

                rounded-2xl

                overflow-hidden

                shadow-sm

                transition-all

                duration-300

                ${

                    isOutOfStock

                        ? "opacity-80"

                        : "hover:shadow-2xl"

                }

            `}

        >


            {/* =================================================
                IMAGE AREA
            ================================================= */}


            <div

                className={`

                    relative

                    overflow-hidden

                    bg-gray-100

                    ${

                        !isOutOfStock

                            ? "cursor-pointer"

                            : "cursor-not-allowed"

                    }

                `}

            >


                {/* =================================================
                    IMAGE
                ================================================= */}


                {isOutOfStock ? (


                    <div

                        className="

                            relative

                            h-[420px]

                        "

                    >


                        <img

                            src={imageUrl}

                            alt={product.product_name}

                            className="

                                w-full

                                h-full

                                object-cover

                                grayscale

                                opacity-40

                            "

                            onError={(event) => {

                                event.currentTarget.src =

                                    "/placeholder.png";

                            }}

                        />


                        <div

                            className="

                                absolute

                                inset-0

                                flex

                                items-center

                                justify-center

                                bg-white/30

                            "

                        >


                            <span

                                className="

                                    bg-black

                                    text-white

                                    px-6

                                    py-3

                                    rounded-full

                                    text-sm

                                    font-bold

                                    tracking-[2px]

                                "

                            >

                                OUT OF STOCK

                            </span>


                        </div>


                    </div>


                ) : (


                    <Link

                        to={`/products/detail/${product.id}`}

                    >


                        <img

                            src={imageUrl}

                            alt={product.product_name}

                            className="

                                w-full

                                h-[420px]

                                object-cover

                                transition-transform

                                duration-500

                                group-hover:scale-105

                            "

                            onError={(event) => {

                                event.currentTarget.src =

                                    "/placeholder.png";

                            }}

                        />


                    </Link>

                )}



                {/* =================================================
                    SALE
                ================================================= */}


                {!isOutOfStock &&

                    discount > 0 && (


                    <span

                        className="

                            absolute

                            top-4

                            left-4

                            bg-red-600

                            text-white

                            px-3

                            py-1

                            rounded-full

                            text-xs

                            font-semibold

                        "

                    >

                        -{discount}%

                    </span>

                )}



                {/* =================================================
                    NEW ARRIVAL
                ================================================= */}


                {!isOutOfStock &&

                    product.is_new_arrival === 1 && (


                    <span

                        className="

                            absolute

                            top-4

                            right-4

                            bg-black

                            text-white

                            px-3

                            py-1

                            rounded-full

                            text-xs

                            font-semibold

                        "

                    >

                        NEW ARRIVAL

                    </span>

                )}



                {/* =================================================
                    WISHLIST
                ================================================= */}


                {!isOutOfStock && (


                    <button

                        type="button"

                        onClick={handleWishlist}

                        disabled={wishlistLoading}

                        className={`

                            absolute

                            right-4

                            bottom-20

                            bg-white

                            rounded-full

                            p-3

                            shadow-lg

                            opacity-0

                            group-hover:opacity-100

                            transition-all

                            duration-300

                            hover:scale-110

                            ${

                                wishlistLoading

                                    ? "cursor-wait"

                                    : "cursor-pointer"

                            }

                        `}

                    >


                        <FaHeart

                            className={`

                                transition-all

                                duration-300

                                ${

                                    isWishlisted

                                        ? "text-red-500 scale-110"

                                        : "text-gray-400"

                                }

                            `}

                        />


                    </button>

                )}



                {/* =================================================
                    ADD TO CART
                ================================================= */}


                {!isOutOfStock && (


                    <Link

                        to={`/products/detail/${product.id}`}

                        className="

                            absolute

                            bottom-0

                            left-0

                            w-full

                            bg-black

                            text-white

                            py-4

                            translate-y-full

                            group-hover:translate-y-0

                            transition-transform

                            duration-300

                            font-semibold

                            text-center

                            flex

                            items-center

                            justify-center

                            gap-2

                        "

                    >

                        <FaShoppingBag />

                        VIEW PRODUCT

                    </Link>

                )}

            </div>



            {/* =================================================
                PRODUCT INFO
            ================================================= */}


            <div

                className="p-5"

            >


                {/* CATEGORY */}


                <p

                    className={`

                        uppercase

                        text-xs

                        tracking-[3px]

                        ${

                            isOutOfStock

                                ? "text-gray-300"

                                : "text-gray-400"

                        }

                    `}

                >

                    {product.category_name}

                </p>



                {/* NAME */}


                <h3

                    className={`

                        mt-3

                        text-lg

                        font-bold

                        line-clamp-2

                        ${

                            isOutOfStock

                                ? "text-gray-400"

                                : "text-gray-900"

                        }

                    `}

                >

                    {product.product_name}

                </h3>



                {/* PRICE */}


                <div

                    className="

                        mt-4

                        flex

                        items-center

                        gap-3

                        flex-wrap

                    "

                >


                    {discount > 0 ? (


                        <>


                            <span

                                className={`

                                    text-2xl

                                    font-bold

                                    ${

                                        isOutOfStock

                                            ? "text-gray-400"

                                            : "text-red-600"

                                    }

                                `}

                            >

                                {finalPrice.toLocaleString(

                                    "vi-VN"

                                )}đ

                            </span>


                            <span

                                className="

                                    text-gray-400

                                    line-through

                                "

                            >

                                {price.toLocaleString(

                                    "vi-VN"

                                )}đ

                            </span>


                        </>

                    ) : (


                        <span

                            className={`

                                text-2xl

                                font-bold

                                ${

                                    isOutOfStock

                                        ? "text-gray-400"

                                        : "text-black"

                                }

                            `}

                        >

                            {price.toLocaleString(

                                "vi-VN"

                            )}đ

                        </span>

                    )}

                </div>



                {/* OUT OF STOCK */}


                {isOutOfStock && (


                    <p

                        className="

                            mt-3

                            text-xs

                            font-semibold

                            tracking-wider

                            text-red-500

                        "

                    >

                        CURRENTLY UNAVAILABLE

                    </p>

                )}

            </div>


        </div>

    );

}


export default ProductCard;