import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import { getCategories } from "../../services/categoryService";


// ================= CREATE SLUG =================

function createSlug(name) {

    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

}


// ================= NAV ITEM =================

function NavItem({ to, children, end = false }) {

    return (

        <NavLink

            to={to}

            end={end}

            className={({ isActive }) => `

                group
                relative
                inline-flex
                items-center
                h-10
                whitespace-nowrap
                uppercase
                tracking-[2px]
                text-sm
                font-semibold
                transition-colors
                duration-300

                ${
                    isActive
                        ? "text-black"
                        : "text-gray-500 hover:text-black"
                }

            `}

        >

            {({ isActive }) => (

                <>

                    {children}


                    <span

                        className={`

                            absolute
                            left-0
                            -bottom-2
                            h-[2px]
                            bg-black
                            transition-[width]
                            duration-300

                            ${
                                isActive
                                    ? "w-full"
                                    : "w-0 group-hover:w-full"
                            }

                        `}

                    />

                </>

            )}

        </NavLink>

    );

}


// ================= NAV LINKS =================

function NavLinks() {


    const [categories, setCategories] = useState([]);


    useEffect(() => {


        let isMounted = true;


        const loadCategories = async () => {


            try {


                const res = await getCategories();


                if (!isMounted) return;


                const mainCategories =

                    (res.data || [])

                        .filter(

                            category =>

                                category.parent_id == null

                        )

                        .sort(

                            (a, b) => a.id - b.id

                        );


                setCategories(mainCategories);


            }


            catch (error) {


                console.error(

                    "Failed to load categories:",

                    error

                );


            }


        };


        loadCategories();


        return () => {

            isMounted = false;

        };


    }, []);


    return (

        <nav

            className="

                flex
                items-center
                gap-10
                whitespace-nowrap
                flex-shrink-0

            "

        >


            {/* HOME */}

            <NavItem

                to="/"

                end

            >

                HOME

            </NavItem>


            {/* PRODUCTS */}

            <NavItem

                to="/products"

                end

            >

                PRODUCTS

            </NavItem>


            {/* CATEGORIES */}

            {categories.map(category => (

                <NavItem

                    key={category.id}

                    to={

                        `/products/${

                            createSlug(

                                category.category_name

                            )

                        }`

                    }

                >

                    {category.category_name}

                </NavItem>

            ))}


            {/* SALE */}

            <NavItem

                to="/products/sale"

            >

                SALE

            </NavItem>


        </nav>

    );

}


export default NavLinks;