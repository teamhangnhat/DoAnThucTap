import {

    FaHeart,

    FaUser,

    FaShoppingBag,

    FaClipboardList

} from "react-icons/fa";


import {

    useNavigate

} from "react-router-dom";


function NavbarIcons() {


    const navigate = useNavigate();


    // =====================================================
    // CHECK USER
    // =====================================================

    const getUser = () => {

        return JSON.parse(

            localStorage.getItem("user")

        );

    };



    // =====================================================
    // WISHLIST
    // =====================================================

    const handleWishlist = () => {


        const user = getUser();


        if (!user?.id) {

            navigate("/login");

            return;

        }


        navigate("/wishlist");

    };



    // =====================================================
    // PROFILE
    // =====================================================

    const handleUser = () => {


        const user = getUser();


        if (user?.id) {

            navigate("/profile");

        }

        else {

            navigate("/login");

        }

    };



    // =====================================================
    // ORDERS
    // =====================================================

    const handleOrders = () => {


        const user = getUser();


        if (!user?.id) {

            navigate("/login");

            return;

        }


        navigate("/orders");

    };



    // =====================================================
    // CART
    // =====================================================

    const handleCart = () => {


        const user = getUser();


        if (!user?.id) {

            navigate("/login");

            return;

        }


        navigate("/cart");

    };



    return (


        <div className="flex items-center gap-6 text-xl">


            {/* WISHLIST */}

            <FaHeart

                onClick={handleWishlist}

                className="cursor-pointer hover:scale-110 duration-300"

            />



            {/* ORDERS */}

            <FaClipboardList

                onClick={handleOrders}

                className="cursor-pointer hover:scale-110 duration-300"

            />



            {/* USER */}

            <FaUser

                onClick={handleUser}

                className="cursor-pointer hover:scale-110 duration-300"

            />



            {/* CART */}

            <div

                onClick={handleCart}

                className="relative cursor-pointer"

            >


                <FaShoppingBag

                    className="hover:scale-110 duration-300"

                />


                <span

                    className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center"

                >

                    0

                </span>


            </div>


        </div>

    );

}


export default NavbarIcons;