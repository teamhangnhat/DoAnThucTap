import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.png";

import {
    FaInstagram,
    FaFacebookF,
    FaTiktok,
    FaCcVisa,
    FaCcMastercard,
    FaCcPaypal
} from "react-icons/fa";

import {
    SiApplepay,
    SiGooglepay
} from "react-icons/si";

function Footer() {

    return (

        <footer className="bg-[#111] text-white">

            {/* Top */}

            <div className="max-w-7xl mx-auto px-6 py-20">

                <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-14">

                    {/* Logo */}

                    <div>

                        <img
                            src={logo}
                            alt="DK Clothing"
                            className="w-40 mb-6"
                        />

                        <p className="text-gray-400 leading-8">

                            Premium fashion crafted with timeless elegance,
                            quality fabrics and modern everyday style.

                        </p>

                        <div className="flex gap-4 mt-8">

                            {[

                                <FaInstagram />,
                                <FaFacebookF />,
                                <FaTiktok />

                            ].map((icon, index) => (

                                <a

                                    key={index}

                                    href="#"

                                    className="
                                        w-11
                                        h-11
                                        rounded-full
                                        border
                                        border-gray-700
                                        flex
                                        items-center
                                        justify-center
                                        hover:bg-white
                                        hover:text-black
                                        hover:scale-110
                                        duration-300
                                    "

                                >

                                    {icon}

                                </a>

                            ))}

                        </div>

                    </div>

                    {/* Shop */}

                    <div>

                        <h3 className="font-bold text-lg mb-6">

                            SHOP

                        </h3>

                        <ul className="space-y-4 text-gray-400">

                            <li><Link to="/products" className="hover:text-white duration-300">New Arrival</Link></li>

                            <li><Link to="/products" className="hover:text-white duration-300">Best Seller</Link></li>

                            <li><Link to="/products/men" className="hover:text-white duration-300">Men</Link></li>

                            <li><Link to="/products/women" className="hover:text-white duration-300">Women</Link></li>

                            <li><Link to="/products/accessories" className="hover:text-white duration-300">Accessories</Link></li>

                            <li><Link to="/products/sale" className="hover:text-white duration-300">Sale</Link></li>

                        </ul>

                    </div>

                    {/* Customer */}

                    <div>

                        <h3 className="font-bold text-lg mb-6">

                            CUSTOMER

                        </h3>

                        <ul className="space-y-4 text-gray-400">

                            <li><Link to="/profile" className="hover:text-white duration-300">My Account</Link></li>

                            <li><Link to="/orders" className="hover:text-white duration-300">Order History</Link></li>

                            <li><a href="#" className="hover:text-white duration-300">Shipping Policy</a></li>

                            <li><a href="#" className="hover:text-white duration-300">Return Policy</a></li>

                            <li><a href="#" className="hover:text-white duration-300">Privacy Policy</a></li>

                            <li><a href="#" className="hover:text-white duration-300">FAQ</a></li>

                        </ul>

                    </div>

                    {/* Contact */}

                    <div>

                        <h3 className="font-bold text-lg mb-6">

                            CONTACT

                        </h3>

                        <ul className="space-y-4 text-gray-400">

                            <li>duykhanh20082005@gmail.com</li>

                            <li>0794 914 523</li>

                            <li>Ho Chi Minh City</li>

                            <li>Monday - Sunday</li>

                            <li>09:00 - 22:00</li>

                        </ul>

                    </div>

                    {/* Payment */}

                    <div>

                        <h3 className="font-bold text-lg mb-6">

                            PAYMENT

                        </h3>

                        <p className="text-gray-400 mb-6">

                            Secure payment methods

                        </p>

                        <div className="flex flex-wrap gap-4 text-4xl">

                            <FaCcVisa className="hover:text-white text-gray-500 duration-300 cursor-pointer"/>

                            <FaCcMastercard className="hover:text-white text-gray-500 duration-300 cursor-pointer"/>

                            <FaCcPaypal className="hover:text-white text-gray-500 duration-300 cursor-pointer"/>

                            <SiApplepay className="hover:text-white text-gray-500 duration-300 cursor-pointer"/>

                            <SiGooglepay className="hover:text-white text-gray-500 duration-300 cursor-pointer"/>

                        </div>

                    </div>

                </div>

            </div>

            {/* Divider */}

            <div className="border-t border-gray-800"></div>

            {/* Bottom */}

            <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">

                <p>

                    © 2026 DK Clothing. All Rights Reserved.

                </p>

                <div className="flex gap-8">

                    <a href="#" className="hover:text-white duration-300">

                        Privacy Policy

                    </a>

                    <a href="#" className="hover:text-white duration-300">

                        Terms of Service

                    </a>

                    <a href="#" className="hover:text-white duration-300">

                        Cookies

                    </a>

                </div>

            </div>

        </footer>

    );

}

export default Footer;