import {

    useEffect,

    useState

} from "react";


import {

    useNavigate

} from "react-router-dom";


import {

    FaHeart,

    FaShoppingBag,

    FaTrash

} from "react-icons/fa";


import {

    getWishlist,

    removeFromWishlist

} from "../../services/wishlistService";


// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (imagePath) => {

    if (!imagePath) {

        return "/placeholder.png";

    }


    if (

        imagePath.startsWith("http")

    ) {

        return imagePath;

    }


    return `http://localhost:5000${

        imagePath.startsWith("/")

            ? imagePath

            : `/${imagePath}`

    }`;

};


// =====================================================
// WISHLIST
// =====================================================

function Wishlist() {


    const navigate = useNavigate();


    const [

        wishlistItems,

        setWishlistItems

    ] = useState([]);


    const [

        loading,

        setLoading

    ] = useState(true);


    const [

        error,

        setError

    ] = useState("");



    // =================================================
    // LOAD WISHLIST
    // =================================================

    const loadWishlist = async () => {

        try {

            setLoading(true);

            setError("");


            const user = JSON.parse(

                localStorage.getItem("user")

            );


            if (!user?.id) {

                navigate("/login");

                return;

            }


            const response = await getWishlist(

                user.id

            );


            setWishlistItems(

                Array.isArray(response.data)

                    ? response.data

                    : []

            );

        }


        catch (err) {

            console.error(

                "Load wishlist error:",

                err

            );


            setError(

                err.response?.data?.message

                ||

                "Failed to load wishlist."

            );

        }


        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadWishlist();

    }, []);



    // =================================================
    // REMOVE WISHLIST
    // =================================================

    const handleRemove = async (

        productId

    ) => {

        try {

            const user = JSON.parse(

                localStorage.getItem("user")

            );


            if (!user?.id) {

                navigate("/login");

                return;

            }


            await removeFromWishlist(

                user.id,

                productId

            );


            setWishlistItems(

                previousItems =>

                    previousItems.filter(

                        item =>

                            item.product_id !== productId

                    )

            );

        }


        catch (err) {

            console.error(

                "Remove wishlist error:",

                err

            );


            alert(

                err.response?.data?.message

                ||

                "Failed to remove product."

            );

        }

    };



    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <main className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">

                <div className="text-center">

                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />

                    <p className="text-sm text-gray-500">

                        Loading wishlist...

                    </p>

                </div>

            </main>

        );

    }



    return (

        <main className="min-h-screen bg-[#f8f8f6] py-10 sm:py-16">


            <div className="max-w-7xl mx-auto px-5 sm:px-8">


                {/* HEADER */}

                <div className="mb-10">


                    <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">

                        Your Favorites

                    </p>


                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">

                        Wishlist

                    </h1>


                    <p className="text-gray-500 mt-3">

                        Products you love and want to keep.

                    </p>

                </div>



                {/* ERROR */}

                {error && (

                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">

                        {error}

                    </div>

                )}



                {/* EMPTY */}

                {wishlistItems.length === 0 ? (

                    <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm">


                        <FaHeart className="text-5xl text-gray-300 mx-auto mb-6" />


                        <h2 className="text-2xl font-bold mb-3">

                            Your wishlist is empty

                        </h2>


                        <p className="text-gray-500 mb-8">

                            Save products you love and find them here later.

                        </p>


                        <button

                            type="button"

                            onClick={() =>

                                navigate("/products")

                            }

                            className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition"

                        >

                            SHOP NOW

                        </button>

                    </div>

                ) : (


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


                        {wishlistItems.map(item => {


                            const price =

                                Number(item.price) || 0;


                            const finalPrice =

                                Number(item.final_price) || price;


                            const discount =

                                Number(item.discount_percent) || 0;


                            return (

                                <div

                                    key={item.wishlist_id}

                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition"

                                >


                                    {/* IMAGE */}

                                    <div

                                        className="relative h-[360px] bg-gray-100 cursor-pointer"

                                        onClick={() =>

                                            navigate(

                                                `/products/detail/${item.product_id}`

                                            )

                                        }

                                    >


                                        <img

                                            src={getImageUrl(

                                                item.image_url

                                            )}

                                            alt={item.product_name}

                                            className="w-full h-full object-cover"

                                            onError={(event) => {

                                                event.currentTarget.src =

                                                    "/placeholder.png";

                                            }}

                                        />


                                        {discount > 0 && (

                                            <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">

                                                -{discount}%

                                            </span>

                                        )}


                                        <button

                                            type="button"

                                            onClick={(event) => {

                                                event.stopPropagation();

                                                handleRemove(

                                                    item.product_id

                                                );

                                            }}

                                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow hover:scale-110 transition"

                                        >

                                            <FaTrash />

                                        </button>

                                    </div>



                                    {/* INFO */}

                                    <div className="p-5">


                                        <h2 className="text-lg font-bold line-clamp-2">

                                            {item.product_name}

                                        </h2>


                                        <div className="mt-4 flex items-center gap-3 flex-wrap">


                                            <span className="text-xl font-bold text-red-600">

                                                {finalPrice.toLocaleString(

                                                    "vi-VN"

                                                )}đ

                                            </span>


                                            {discount > 0 && (

                                                <span className="text-sm text-gray-400 line-through">

                                                    {price.toLocaleString(

                                                        "vi-VN"

                                                    )}đ

                                                </span>

                                            )}

                                        </div>


                                        <button

                                            type="button"

                                            onClick={() =>

                                                navigate(

                                                    `/products/detail/${item.product_id}`

                                                )

                                            }

                                            className="w-full mt-5 bg-black text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition"

                                        >

                                            <FaShoppingBag />

                                            VIEW PRODUCT

                                        </button>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </main>

    );

}


export default Wishlist;