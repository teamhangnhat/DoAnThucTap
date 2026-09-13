import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import NavLinks from "./NavLinks";
import NavbarIcons from "./NavbarIcons";

import { getWebsiteSettings } from "../../services/homeService";

function Navbar() {

    const [scrolled, setScrolled] = useState(false);

    const [settings, setSettings] = useState(null);

    const location = useLocation();


    // ================= LOAD WEBSITE SETTINGS =================

    useEffect(() => {

        const fetchWebsiteSettings = async () => {

            try {

                const data = await getWebsiteSettings();

                setSettings(data);

            } catch (error) {

                console.error(
                    "Cannot load website settings:",
                    error
                );

            }

        };

        fetchWebsiteSettings();

    }, []);


    // ================= SCROLL =================

    useEffect(() => {

        const handleScroll = () => {

            setScrolled(window.scrollY > 30);

        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };

    }, []);


    // ================= LOGO CLICK =================

    const handleLogoClick = () => {

        if (location.pathname === "/") {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    };


    return (

        <nav
            className={`
                sticky
                top-0
                z-50
                bg-white/90
                backdrop-blur-md
                border-b
                border-gray-100
                transition-all
                duration-300
                ${scrolled ? "shadow-md" : ""}
            `}
        >

            <div className="max-w-screen-2xl mx-auto px-10">

                <div
                    className={`
                        flex
                        items-center
                        justify-between
                        ${scrolled ? "py-4" : "py-6"}
                        transition-all
                        duration-300
                    `}
                >

                    {/* ================= LOGO ================= */}

                    <Link
                        to="/"
                        onClick={handleLogoClick}
                        className="flex-shrink-0"
                    >

                        {settings ? (

                            <img
                                src={`http://localhost:5000/${settings.logo_url}`}
                                alt={settings.site_name}
                                className={`
                                    object-contain
                                    transition-all
                                    duration-300
                                    hover:scale-105
                                    ${scrolled ? "h-20" : "h-28"}
                                `}
                            />

                        ) : (

                            <div
                                className={`
                                    ${scrolled ? "h-20" : "h-28"}
                                    w-32
                                    animate-pulse
                                    bg-gray-100
                                `}
                            ></div>

                        )}

                    </Link>


                    {/* ================= MENU ================= */}

                    <div
                        className="
                            hidden
                            lg:flex
                            flex-1
                            justify-center
                        "
                    >

                        <NavLinks />

                    </div>


                    {/* ================= ICONS ================= */}

                    <NavbarIcons />

                </div>

            </div>

        </nav>

    );

}

export default Navbar;