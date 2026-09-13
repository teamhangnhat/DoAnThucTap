import { FaPhoneAlt } from "react-icons/fa";

function Header() {
    return (
        <div className="bg-black text-white text-sm">

            <div className="max-w-screen-2xl mx-auto px-10 h-10 flex justify-between items-center">

                <span>
                    FREE SHIPPING FOR ORDERS OVER 999.000đ
                </span>

                <div className="flex items-center gap-2">
                    <FaPhoneAlt />
                    <span>0794 914 523</span>
                </div>

            </div>

        </div>
    );
}

export default Header;