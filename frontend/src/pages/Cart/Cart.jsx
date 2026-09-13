import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaMinus,
    FaPlus,
    FaTrash,
    FaArrowLeft,
    FaChevronDown,
    FaShoppingBag
} from "react-icons/fa";

import {
    getCart,
    updateCartItem,
    deleteCartItem
} from "../../services/cartService";

// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return "/placeholder.png";
    }

    if (imagePath.startsWith("http")) {
        return imagePath;
    }

    return `http://localhost:5000${
        imagePath.startsWith("/")
            ? imagePath
            : `/${imagePath}`
    }`;
};

// =====================================================
// COLOR NAME -> COLOR CODE
// =====================================================

const getColorCode = (colorName) => {
    const color = colorName?.toLowerCase()?.trim();

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
// CART
// =====================================================

function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =================================================
    // LOAD CART
    // =================================================

    const loadCart = async () => {
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

            const response = await getCart(user.id);

            setCartItems(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Load cart error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load cart."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    // =================================================
    // UPDATE CART
    // =================================================

    const handleUpdateItem = async (
        item,
        newQuantity = item.quantity,
        newSizeId = item.size_id,
        newColorId = item.color_id
    ) => {
        if (Number(newQuantity) < 1) {
            return;
        }

        const quantity = Number(newQuantity);

        // Update UI immediately
        setCartItems((previousItems) =>
            previousItems.map((cartItem) =>
                cartItem.id === item.id
                    ? {
                          ...cartItem,
                          quantity,
                          subtotal:
                              Number(cartItem.final_price) *
                              quantity
                      }
                    : cartItem
            )
        );

        try {
            await updateCartItem({
                cart_item_id: item.id,
                quantity,
                size_id: Number(newSizeId),
                color_id: Number(newColorId)
            });
        } catch (err) {
            console.error(
                "Update cart item error:",
                err
            );

            await loadCart();

            alert(
                err.response?.data?.message ||
                "Failed to update cart item."
            );
        }
    };

    // =================================================
    // QUANTITY +
    // =================================================

    const increaseQuantity = (item) => {
        const stock = Number(item.stock) || 0;
        const quantity = Number(item.quantity);

        if (quantity >= stock) {
            alert(
                `Only ${stock} items are available for this size and color.`
            );

            return;
        }

        handleUpdateItem(item, quantity + 1);
    };

    // =================================================
    // QUANTITY -
    // =================================================

    const decreaseQuantity = (item) => {
        const quantity = Number(item.quantity);

        if (quantity <= 1) {
            return;
        }

        handleUpdateItem(item, quantity - 1);
    };

    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (itemId) => {
        try {
            await deleteCartItem(itemId);

            setCartItems((previousItems) =>
                previousItems.filter(
                    (item) => item.id !== itemId
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to remove item."
            );
        }
    };

    // =================================================
    // CHANGE SIZE
    // =================================================

    const handleSizeChange = (item, sizeId) => {
        handleUpdateItem(
            item,
            item.quantity,
            sizeId,
            item.color_id
        );
    };

    // =================================================
    // CHANGE COLOR
    // =================================================

    const handleColorChange = (item, colorId) => {
        handleUpdateItem(
            item,
            item.quantity,
            item.size_id,
            colorId
        );
    };

    // =================================================
    // TOTAL
    // =================================================

    const totalAmount = cartItems.reduce(
        (total, item) =>
            total + Number(item.subtotal),
        0
    );

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-5" />

                    <p className="text-sm text-gray-500">
                        Loading cart...
                    </p>
                </div>
            </main>
        );
    }

    // =================================================
    // PAGE
    // =================================================

    return (
        <main className="min-h-screen bg-[#f8f8f6] py-10 sm:py-16">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* HEADER */}

                <div className="mb-10">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 text-gray-500 hover:text-black transition mb-7"
                    >
                        <FaArrowLeft />
                        Continue Shopping
                    </button>

                    <div className="flex items-end justify-between gap-5">

                        <div>

                            <p className="text-xs uppercase tracking-[4px] text-gray-400 mb-3">
                                Your Selection
                            </p>

                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                                Shopping Cart
                            </h1>

                            <p className="text-gray-500 mt-3">
                                Review and update your items before checkout.
                            </p>

                        </div>

                        <div className="hidden sm:flex items-center gap-3 text-gray-500">

                            <FaShoppingBag />

                            <span>
                                {cartItems.length} item
                                {cartItems.length !== 1 && "s"}
                            </span>

                        </div>

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">
                        {error}
                    </div>
                )}

                {/* EMPTY CART */}

                {cartItems.length === 0 ? (

                    <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm">

                        <FaShoppingBag className="text-5xl text-gray-300 mx-auto mb-6" />

                        <h2 className="text-2xl font-bold mb-3">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mb-8">
                            Start shopping and add some products to your cart.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/products")}
                            className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition"
                        >
                            SHOP NOW
                        </button>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* CART ITEMS */}

                        <div className="lg:col-span-2 space-y-5">

                            {cartItems.map((item) => {

                                const stock =
                                    Number(item.stock) || 0;

                                const quantity =
                                    Number(item.quantity);

                                const colorCode =
                                    getColorCode(
                                        item.color_name
                                    );

                                return (

                                    <div
                                        key={item.id}
                                        className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm"
                                    >

                                        <div className="flex flex-col sm:flex-row gap-5">

                                            {/* IMAGE */}

                                            <div className="w-full sm:w-36 h-52 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">

                                                <img
                                                    src={getImageUrl(
                                                        item.image_url
                                                    )}
                                                    alt={
                                                        item.product_name
                                                    }
                                                    className="w-full h-full object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.src =
                                                            "/placeholder.png";
                                                    }}
                                                />

                                            </div>

                                            {/* INFO */}

                                            <div className="flex-1">

                                                <div className="flex justify-between gap-4">

                                                    <div>

                                                        <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-2">
                                                            Product
                                                        </p>

                                                        <h2 className="text-xl font-bold">
                                                            {
                                                                item.product_name
                                                            }
                                                        </h2>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                </div>

                                                {/* PRICE */}

                                                <div className="mt-4">

                                                    <span className="text-lg font-bold">

                                                        {Number(
                                                            item.final_price
                                                        ).toLocaleString(
                                                            "vi-VN"
                                                        )}

                                                        ₫

                                                    </span>

                                                    {Number(
                                                        item.discount_percent
                                                    ) > 0 && (

                                                        <span className="ml-3 text-sm text-gray-400 line-through">

                                                            {Number(
                                                                item.price
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )}

                                                            ₫

                                                        </span>

                                                    )}

                                                </div>

                                                {/* OPTIONS */}

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                                                    {/* COLOR */}

                                                    <div>

                                                        <label className="text-xs uppercase tracking-[2px] text-gray-400 block mb-2">
                                                            Color
                                                        </label>

                                                        <div className="relative">

                                                            <select
                                                                value={
                                                                    item.color_id
                                                                }
                                                                onChange={(event) =>
                                                                    handleColorChange(
                                                                        item,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium bg-white outline-none focus:border-black"
                                                            >

                                                                <option
                                                                    value={
                                                                        item.color_id
                                                                    }
                                                                >
                                                                    {
                                                                        item.color_name
                                                                    }
                                                                </option>

                                                            </select>

                                                            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none" />

                                                        </div>

                                                        <div className="flex items-center gap-2 mt-2">

                                                            <span
                                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                                style={{
                                                                    backgroundColor:
                                                                        colorCode
                                                                }}
                                                            />

                                                            <span className="text-xs text-gray-500">
                                                                {
                                                                    item.color_name
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                    {/* SIZE */}

                                                    <div>

                                                        <label className="text-xs uppercase tracking-[2px] text-gray-400 block mb-2">
                                                            Size
                                                        </label>

                                                        <div className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium">
                                                            {
                                                                item.size_name ||
                                                                item.size
                                                            }
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* QUANTITY */}

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-gray-100">

                                                    <div>

                                                        <p className="text-xs uppercase tracking-[2px] text-gray-400 mb-2">
                                                            Quantity
                                                        </p>

                                                        <div className="flex items-center border border-gray-200 rounded-full w-fit">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    decreaseQuantity(
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    quantity <=
                                                                    1
                                                                }
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 rounded-l-full"
                                                            >
                                                                <FaMinus size={10} />
                                                            </button>

                                                            <span className="w-12 text-center font-semibold">
                                                                {quantity}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    increaseQuantity(
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    quantity >=
                                                                    stock
                                                                }
                                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 rounded-r-full"
                                                            >
                                                                <FaPlus size={10} />
                                                            </button>

                                                        </div>

                                                    </div>

                                                    <div className="text-left sm:text-right">

                                                        <p className="text-xs text-gray-400 mb-1">
                                                            {stock} available for this variant
                                                        </p>

                                                        <p className="text-xl font-bold">

                                                            {Number(
                                                                item.subtotal
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )}

                                                            ₫

                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                        {/* SUMMARY */}

                        <div className="bg-white rounded-[2rem] p-7 sm:p-8 h-fit shadow-sm lg:sticky lg:top-8">

                            <p className="text-xs uppercase tracking-[3px] text-gray-400 mb-3">
                                Summary
                            </p>

                            <h2 className="text-2xl font-bold mb-8">
                                Order Summary
                            </h2>

                            {/* SUBTOTAL */}

                            <div className="flex justify-between text-gray-600">

                                <span>
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-900">

                                    {totalAmount.toLocaleString(
                                        "vi-VN"
                                    )}

                                    ₫

                                </span>

                            </div>

                            {/* TOTAL */}

                            <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between text-xl font-bold">

                                <span>
                                    Total
                                </span>

                                <span>

                                    {totalAmount.toLocaleString(
                                        "vi-VN"
                                    )}

                                    ₫

                                </span>

                            </div>

                            {/* CHECKOUT */}

                            <button
                                type="button"
                               onClick={() =>
    navigate("/checkout", {
        state: {
            cartItems
        } })
}
                                className="w-full mt-8 bg-black text-white py-5 rounded-full font-bold tracking-[1px] hover:bg-gray-800 transition"
                            >
                                CONTINUE TO CHECKOUT
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                You can review your order again before payment.
                            </p>

                        </div>

                    </div>

                )}

            </div>

        </main>
    );
}

export default Cart;