import {
    FaTruck,
    FaShieldAlt,
    FaUndoAlt,
    FaGem
} from "react-icons/fa";

const features = [
    {
        icon: <FaTruck />,
        title: "Free Shipping",
        description: "Free delivery on all orders over 500.000đ."
    },
    {
        icon: <FaGem />,
        title: "Premium Quality",
        description: "Carefully selected fabrics with premium craftsmanship."
    },
    {
        icon: <FaUndoAlt />,
        title: "Easy Returns",
        description: "7-day hassle-free return policy."
    },
    {
        icon: <FaShieldAlt />,
        title: "Secure Payment",
        description: "100% secure payment with trusted gateways."
    }
];

function WhyChoose() {

    return (

        <div className="max-w-7xl mx-auto px-6">

            <div className="text-center mb-16">

                <p className="uppercase tracking-[6px] text-gray-400 text-sm">
                    WHY CHOOSE US
                </p>

                <h2 className="text-5xl font-bold mt-3">
                    Why Choose DK Clothing
                </h2>

                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    We believe fashion should combine premium quality,
                    timeless elegance and exceptional customer experience.
                </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {features.map((item, index) => (

                    <div
                        key={index}
                        className="
                            bg-white
                            rounded-3xl
                            p-10
                            text-center
                            shadow-sm
                            hover:shadow-2xl
                            hover:-translate-y-3
                            duration-300
                            border
                            border-gray-100
                        "
                    >

                        <div
                            className="
                                w-20
                                h-20
                                rounded-full
                                bg-black
                                text-white
                                flex
                                items-center
                                justify-center
                                text-3xl
                                mx-auto
                                mb-6
                                duration-300
                                hover:scale-110
                            "
                        >
                            {item.icon}
                        </div>

                        <h3 className="text-xl font-bold mb-3">
                            {item.title}
                        </h3>

                        <p className="text-gray-500 leading-7">
                            {item.description}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default WhyChoose;