import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    FaArrowLeft,
    FaHeart,
    FaMinus,
    FaPlus,
    FaShoppingBag,
    FaTruck,
    FaShieldAlt,
    FaCheck,
    FaBoxOpen
} from "react-icons/fa";

import {
    getProductById
} from "../../services/productService";

import {
    addToCart
} from "../../services/cartService";


// =====================================================
// API URL
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// COLOR NAME -> COLOR CODE
// =====================================================

const getColorCode = (colorName) => {

    const color =
        colorName
            ?.toLowerCase()
            ?.trim();


    const colorMap = {

        black: "#000000",
        white: "#FFFFFF",
        red: "#EF4444",
        blue: "#3B82F6",
        navy: "#1E3A8A",
        green: "#22C55E",
        yellow: "#EAB308",
        orange: "#F97316",
        purple: "#A855F7",
        pink: "#EC4899",
        brown: "#92400E",
        gray: "#6B7280",
        grey: "#6B7280",
        beige: "#F5F5DC",
        cream: "#FFFDD0",
        khaki: "#C3B091",
        silver: "#C0C0C0",
        gold: "#D4AF37"

    };


    return colorMap[color] || "#D1D5DB";

};


// =====================================================
// PRODUCT DETAIL
// =====================================================

function ProductDetail() {

    const {
        id
    } = useParams();


    const navigate =
        useNavigate();


    // =================================================
    // STATE
    // =================================================

    const [
        product,
        setProduct
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        quantity,
        setQuantity
    ] = useState(1);


    const [
        selectedColor,
        setSelectedColor
    ] = useState(null);


    const [
        selectedSize,
        setSelectedSize
    ] = useState(null);


    const [
        isWishlisted,
        setIsWishlisted
    ] = useState(false);


    const [
        addingToCart,
        setAddingToCart
    ] = useState(false);


    // =================================================
    // LOAD PRODUCT
    // =================================================

    useEffect(() => {

        let isMounted = true;


        const loadProduct = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getProductById(id);


                if (!isMounted) {

                    return;

                }


                const productData =
                    response.data;


                setProduct(
                    productData
                );


                // =====================================
                // DEFAULT COLOR
                // =====================================

                if (

                    productData.colors &&

                    productData.colors.length > 0

                ) {

                    setSelectedColor(

                        productData.colors[0].id

                    );

                }


                // =====================================
                // DEFAULT SIZE
                // =====================================

                if (

                    productData.sizes &&

                    productData.sizes.length > 0

                ) {

                    setSelectedSize(

                        productData.sizes[0].id

                    );

                }

            }


            catch (err) {

                console.error(

                    "Load product detail error:",

                    err

                );


                if (isMounted) {

                    setError(

                        "Failed to load product."

                    );

                }

            }


            finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };


        loadProduct();


        return () => {

            isMounted = false;

        };


    }, [id]);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <main className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">

                <div className="text-center">

                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6" />

                    <p className="text-xs uppercase tracking-[4px] text-gray-500">

                        Loading Product

                    </p>

                </div>

            </main>

        );

    }


    // =================================================
    // NOT FOUND
    // =================================================

    if (

        error ||

        !product

    ) {

        return (

            <main className="min-h-screen flex items-center justify-center px-6 bg-[#f8f8f6]">

                <div className="text-center max-w-md">

                    <FaBoxOpen className="text-5xl text-gray-300 mx-auto mb-6" />


                    <h1 className="text-4xl font-bold mb-4">

                        Product Not Found

                    </h1>


                    <p className="text-gray-500 mb-8">

                        The product you are looking for does not exist.

                    </p>


                    <Link

                        to="/products"

                        className="inline-flex items-center gap-3 bg-black text-white px-7 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all"

                    >

                        <FaArrowLeft />

                        Back To Products

                    </Link>

                </div>

            </main>

        );

    }


    // =================================================
    // PRODUCT DATA
    // =================================================

    const price =
        Number(
            product.price
        ) || 0;


    const discount =
        Number(
            product.discount_percent
        ) || 0;


    const finalPrice =
        price *
        (100 - discount) /
        100;


    const colors =
        product.colors || [];


    const sizes =
        product.sizes || [];


    const variants =
        product.variants || [];


    // =================================================
    // SELECTED VARIANT
    // =================================================

    const selectedVariant =
        variants.find(

            variant =>

                Number(
                    variant.color_id
                ) === Number(
                    selectedColor
                )

                &&

                Number(
                    variant.size_id
                ) === Number(
                    selectedSize
                )

        );


    // =================================================
    // CURRENT STOCK
    // =================================================

    const stock =
        Number(
            selectedVariant?.stock
        ) || 0;


    const isOutOfStock =
        !selectedVariant ||
        stock <= 0;


    // =================================================
    // SELECTED COLOR DATA
    // =================================================

    const selectedColorData =
        colors.find(

            color =>

                Number(
                    color.id
                ) === Number(
                    selectedColor
                )

        );


    // =================================================
    // IMAGE
    // =================================================

    const imagePath =

        selectedColorData?.image_url

        ||

        product.image_url;


    const imageUrl = imagePath

        ? `${API_URL}${

            imagePath.startsWith("/")

                ? imagePath

                : `/${imagePath}`

        }`

        : "/placeholder.png";


    // =================================================
    // CHECK SIZE STOCK
    // =================================================

    const getSizeStock = (
        sizeId
    ) => {

        const variant =
            variants.find(

                item =>

                    Number(
                        item.color_id
                    ) === Number(
                        selectedColor
                    )

                    &&

                    Number(
                        item.size_id
                    ) === Number(
                        sizeId
                    )

            );


        return Number(
            variant?.stock
        ) || 0;

    };


    // =================================================
    // CHANGE COLOR
    // =================================================

    const handleColorChange = (
        colorId
    ) => {

        setSelectedColor(
            colorId
        );


        setQuantity(
            1
        );


        // =============================================
        // TÌM SIZE CÒN HÀNG ĐẦU TIÊN
        // =============================================

        const availableSize =
            sizes.find(

                size =>

                    getSizeStock(
                        size.id
                    ) > 0

            );


        if (availableSize) {

            setSelectedSize(
                availableSize.id
            );

        }

    };


    // =================================================
    // CHANGE SIZE
    // =================================================

    const handleSizeChange = (
        sizeId
    ) => {

        const sizeStock =
            getSizeStock(
                sizeId
            );


        if (
            sizeStock <= 0
        ) {

            return;

        }


        setSelectedSize(
            sizeId
        );


        setQuantity(
            1
        );

    };


    // =================================================
    // DECREASE QUANTITY
    // =================================================

    const decreaseQuantity = () => {

        setQuantity(

            previous =>

                Math.max(

                    previous - 1,

                    1

                )

        );

    };


    // =================================================
    // INCREASE QUANTITY
    // =================================================

    const increaseQuantity = () => {

        if (
            isOutOfStock
        ) {

            return;

        }


        setQuantity(

            previous =>

                Math.min(

                    previous + 1,

                    stock

                )

        );

    };


    // =================================================
    // WISHLIST
    // =================================================

    const handleWishlist = () => {

        setIsWishlisted(

            previous =>

                !previous

        );

    };


    // =================================================
    // ADD TO CART
    // =================================================

    const handleAddToCart = async () => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            localStorage.setItem(

                "redirectAfterLogin",

                `/products/detail/${product.id}`

            );


            navigate(
                "/login"
            );


            return;

        }


        if (!selectedVariant) {

            alert(

                "Please select an available color and size."

            );


            return;

        }


        if (isOutOfStock) {

            alert(

                "This product variant is out of stock."

            );


            return;

        }


        if (

            quantity >

            stock

        ) {

            alert(

                `Only ${stock} items are available in stock.`

            );


            return;

        }


        try {

            setAddingToCart(
                true
            );


            const user =
                JSON.parse(

                    localStorage.getItem(
                        "user"
                    )

                );


            if (!user?.id) {

                alert(

                    "User information not found. Please login again."

                );


                navigate(
                    "/login"
                );


                return;

            }


            await addToCart({

                customer_id:
                    user.id,

                product_id:
                    product.id,

                color_id:
                    selectedColor,

                size_id:
                    selectedSize,

                quantity

            });


            navigate(
                "/cart"
            );

        }


        catch (err) {

            console.error(

                "Add to cart error:",

                err

            );


            alert(

                err.response?.data?.message ||

                "Failed to add product to cart."

            );

        }


        finally {

            setAddingToCart(
                false
            );

        }

    };


    // =================================================
    // RETURN
    // =================================================

    return (

        <main className="min-h-screen bg-[#f8f8f6] py-8 sm:py-12 lg:py-16">

            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">


                {/* BREADCRUMB */}

                <div className="flex items-center gap-3 mb-8 text-sm text-gray-500">

                    <Link

                        to="/products"

                        className="hover:text-black transition"

                    >

                        Products

                    </Link>


                    <span>/</span>


                    <span className="text-gray-900 font-medium">

                        {product.product_name}

                    </span>

                </div>


                {/* MAIN CARD */}

                <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)]">

                    <div className="grid grid-cols-1 lg:grid-cols-2">


                        {/* IMAGE */}

                        <div className="relative bg-[#f1f1ef] min-h-[560px] sm:min-h-[700px] overflow-hidden">

                            <img

                                src={imageUrl}

                                alt={product.product_name}

                                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"

                                onError={event => {

                                    event.currentTarget.src =
                                        "/placeholder.png";

                                }}

                            />


                            {discount > 0 && (

                                <div className="absolute top-7 left-7 bg-black text-white px-5 py-2 rounded-full text-xs font-bold tracking-[2px]">

                                    SALE -{discount}%

                                </div>

                            )}


                            <button

                                type="button"

                                onClick={
                                    handleWishlist
                                }

                                className={`

                                    absolute

                                    top-7

                                    right-7

                                    w-12

                                    h-12

                                    rounded-full

                                    flex

                                    items-center

                                    justify-center

                                    shadow-lg

                                    transition-all

                                    duration-300

                                    hover:scale-110

                                    ${

                                        isWishlisted

                                            ? "bg-black text-white"

                                            : "bg-white text-black"

                                    }

                                `}

                            >

                                <FaHeart />

                            </button>

                        </div>


                        {/* INFORMATION */}

                        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">


                            {/* BRAND */}

                            <p className="text-xs uppercase tracking-[5px] text-gray-400 mb-5">

                                {product.brand || "DK Clothing"}

                            </p>


                            {/* CATEGORY */}

                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-4">

                                {product.category_name}

                            </p>


                            {/* NAME */}

                            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight text-gray-900">

                                {product.product_name}

                            </h1>


                            {/* PRICE */}

                            <div className="flex items-center gap-4 flex-wrap mt-8">

                                <span className={`text-3xl sm:text-4xl font-bold ${discount > 0 ? "text-red-600" : "text-gray-900"} ${isOutOfStock ? "text-gray-400" : ""}`}>

                                    {finalPrice.toLocaleString(
                                        "vi-VN"
                                    )}đ

                                </span>


                                {discount > 0 && (

                                    <span className="text-lg text-gray-400 line-through">

                                        {price.toLocaleString(
                                            "vi-VN"
                                        )}đ

                                    </span>

                                )}

                            </div>


                            <div className="h-px bg-gray-200 my-8" />


                            {/* DESCRIPTION */}

                            <div className="mb-8">

                                <h2 className="text-sm uppercase tracking-[2px] font-bold mb-4">

                                    About This Product

                                </h2>


                                <p className="text-gray-600 leading-8 text-[15px]">

                                    {product.description}

                                </p>

                            </div>


                            {/* COLOR */}

                            {colors.length > 0 && (

                                <div className="mb-7">

                                    <div className="flex items-center justify-between mb-4">

                                        <span className="text-sm font-semibold">

                                            Color

                                        </span>


                                        <span className="text-sm text-gray-500">

                                            {selectedColorData?.color_name}

                                        </span>

                                    </div>


                                    <div className="flex flex-wrap gap-4">

                                        {colors.map(

                                            color => {

                                                const isSelected =

                                                    Number(
                                                        selectedColor
                                                    ) === Number(
                                                        color.id
                                                    );


                                                const colorCode =

                                                    getColorCode(

                                                        color.color_name

                                                    );


                                                return (

                                                    <button

                                                        key={
                                                            color.id
                                                        }

                                                        type="button"

                                                        title={
                                                            color.color_name
                                                        }

                                                        onClick={() =>

                                                            handleColorChange(

                                                                color.id

                                                            )

                                                        }

                                                        className={`

                                                            w-11

                                                            h-11

                                                            rounded-full

                                                            border-2

                                                            transition-all

                                                            duration-200

                                                            hover:scale-110

                                                            ${

                                                                isSelected

                                                                    ? "border-black ring-2 ring-gray-300 ring-offset-2"

                                                                    : "border-gray-300"

                                                            }

                                                        `}

                                                        style={{

                                                            backgroundColor:

                                                                colorCode

                                                        }}

                                                    />

                                                );

                                            }

                                        )}

                                    </div>

                                </div>

                            )}


                            {/* SIZE */}

                            {sizes.length > 0 && (

                                <div className="mb-7">

                                    <div className="flex items-center justify-between mb-4">

                                        <span className="text-sm font-semibold">

                                            Size

                                        </span>


                                        <span className="text-sm text-gray-500">

                                            {

                                                sizes.find(

                                                    size =>

                                                        Number(
                                                            size.id
                                                        ) === Number(
                                                            selectedSize
                                                        )

                                                )?.size

                                            }

                                        </span>

                                    </div>


                                    <div className="flex flex-wrap gap-3">

                                        {sizes.map(

                                            size => {

                                                const sizeStock =

                                                    getSizeStock(

                                                        size.id

                                                    );


                                                const sizeOutOfStock =

                                                    sizeStock <= 0;


                                                const isSelected =

                                                    Number(
                                                        selectedSize
                                                    ) === Number(
                                                        size.id
                                                    );


                                                return (

                                                    <button

                                                        key={
                                                            size.id
                                                        }

                                                        type="button"

                                                        disabled={
                                                            sizeOutOfStock
                                                        }

                                                        onClick={() =>

                                                            handleSizeChange(

                                                                size.id

                                                            )

                                                        }

                                                        className={`

                                                            min-w-[58px]

                                                            px-5

                                                            py-3

                                                            rounded-full

                                                            border

                                                            text-sm

                                                            font-semibold

                                                            transition-all

                                                            relative

                                                            ${

                                                                sizeOutOfStock

                                                                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through"

                                                                    : isSelected

                                                                        ? "bg-black text-white border-black"

                                                                        : "bg-white text-gray-700 border-gray-300 hover:border-black"

                                                            }

                                                        `}

                                                    >

                                                        {size.size}

                                                    </button>

                                                );

                                            }

                                        )}

                                    </div>

                                </div>

                            )}


                            {/* STOCK */}

                            <div className="mb-7">

                                {isOutOfStock ? (

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-semibold">

                                        <span className="w-2 h-2 rounded-full bg-red-500" />

                                        OUT OF STOCK

                                    </div>

                                ) : (

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold">

                                        <FaCheck className="text-xs" />

                                        {stock} IN STOCK

                                    </div>

                                )}

                            </div>


                            {/* QUANTITY */}

                            {!isOutOfStock && (

                                <div className="flex items-center justify-between gap-5 mb-7">

                                    <span className="text-sm font-semibold">

                                        Quantity

                                    </span>


                                    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">

                                        <button

                                            type="button"

                                            onClick={
                                                decreaseQuantity
                                            }

                                            disabled={
                                                quantity <= 1
                                            }

                                            className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"

                                        >

                                            <FaMinus size={11} />

                                        </button>


                                        <span className="w-12 text-center font-semibold">

                                            {quantity}

                                        </span>


                                        <button

                                            type="button"

                                            onClick={
                                                increaseQuantity
                                            }

                                            disabled={

                                                quantity >=

                                                stock

                                            }

                                            className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"

                                        >

                                            <FaPlus size={11} />

                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* ADD TO CART */}

                            <button

                                type="button"

                                disabled={

                                    isOutOfStock ||

                                    !selectedVariant ||

                                    addingToCart

                                }

                                onClick={
                                    handleAddToCart
                                }

                                className={`

                                    w-full

                                    py-5

                                    rounded-full

                                    flex

                                    items-center

                                    justify-center

                                    gap-3

                                    font-bold

                                    text-sm

                                    tracking-[2px]

                                    transition-all

                                    duration-300

                                    ${

                                        isOutOfStock ||

                                        !selectedVariant ||

                                        addingToCart

                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"

                                            : "bg-black text-white hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1"

                                    }

                                `}

                            >

                                <FaShoppingBag />

                                {addingToCart

                                    ? "ADDING..."

                                    : isOutOfStock

                                        ? "OUT OF STOCK"

                                        : "ADD TO CART"

                                }

                            </button>


                            {/* FEATURES */}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 pt-8 border-t border-gray-200">

                                <div className="flex items-start gap-3">

                                    <FaTruck className="mt-1 text-gray-700" />

                                    <div>

                                        <p className="text-sm font-semibold">

                                            Fast Delivery

                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">

                                            Quick shipping

                                        </p>

                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <FaShieldAlt className="mt-1 text-gray-700" />

                                    <div>

                                        <p className="text-sm font-semibold">

                                            Secure Shopping

                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">

                                            Safe checkout

                                        </p>

                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <FaShoppingBag className="mt-1 text-gray-700" />

                                    <div>

                                        <p className="text-sm font-semibold">

                                            Premium Quality

                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">

                                            DK Clothing

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* PRODUCT INFORMATION */}

                <section className="mt-10 bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div>

                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">

                                Product

                            </p>

                            <p className="font-semibold">

                                {product.product_name}

                            </p>

                        </div>


                        <div>

                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">

                                Brand

                            </p>

                            <p className="font-semibold">

                                {product.brand || "DK Clothing"}

                            </p>

                        </div>


                        <div>

                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">

                                Category

                            </p>

                            <p className="font-semibold">

                                {product.category_name}

                            </p>

                        </div>

                    </div>

                </section>

            </div>

        </main>

    );

}


export default ProductDetail;