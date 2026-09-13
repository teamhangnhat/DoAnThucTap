import {
    NavLink,
    Outlet,
    Link,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    ShoppingCart,
    Tag,
    UserCog,
    BarChart3,
    LogOut,
    CircleUserRound
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";


function AdminLayout() {


    const navigate = useNavigate();


    const [admin, setAdmin] =

        useState(null);



    // =====================================================
    // LOAD CURRENT ADMIN
    // =====================================================

    useEffect(() => {


        const storedUser =

            localStorage.getItem("user");


        const token =

            localStorage.getItem("token");


        // Không có token hoặc user
        // => quay về Login

        if (

            !token ||

            !storedUser

        ) {

            navigate(

                "/login",

                {

                    replace: true

                }

            );


            return;

        }


        try {


            const user =

                JSON.parse(

                    storedUser

                );


            // Chỉ ADMIN mới được vào Admin Panel

            if (

                user.role !== "ADMIN"

            ) {

                navigate(

                    "/",

                    {

                        replace: true

                    }

                );


                return;

            }


            setAdmin(user);


        }

        catch (error) {


            console.error(

                "Invalid user data:",

                error

            );


            localStorage.removeItem(

                "token"

            );


            localStorage.removeItem(

                "user"

            );


            navigate(

                "/login",

                {

                    replace: true

                }

            );

        }


    }, [navigate]);



    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {


        // Xóa thông tin đăng nhập

        localStorage.removeItem(

            "token"

        );


        localStorage.removeItem(

            "user"

        );


        // Nếu có redirect cũ thì xóa luôn

        localStorage.removeItem(

            "redirectAfterLogin"

        );


        // Quay về Login

        navigate(

            "/login",

            {

                replace: true

            }

        );

    };



    // =====================================================
    // LOADING
    // =====================================================

    if (!admin) {


        return (

            <div className="min-h-screen flex items-center justify-center">

                <p className="text-gray-500">

                    Loading admin panel...

                </p>

            </div>

        );

    }



    const menuItems = [


        {

            name: "Dashboard",

            path: "/admin",

            icon: LayoutDashboard

        },


        {

            name: "Products",

            path: "/admin/products",

            icon: ShoppingBag

        },


        {

            name: "Customers",

            path: "/admin/customers",

            icon: Users

        },


        {

            name: "Orders",

            path: "/admin/orders",

            icon: ShoppingCart

        },


        {

            name: "Flash Sale",

            path: "/admin/flash-sales",

            icon: Tag

        },


        {

            name: "Employees",

            path: "/admin/employees",

            icon: UserCog

        },


        {

            name: "Revenue",

            path: "/admin/revenue",

            icon: BarChart3

        }

    ];



    return (


        <div className="min-h-screen bg-gray-100 flex">


            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}


            <aside className="w-64 bg-black text-white min-h-screen flex flex-col">


                {/* LOGO */}


                <div className="p-6 border-b border-gray-800">


                    <h1 className="text-2xl font-bold">

                        DK CLOTHING

                    </h1>


                    <p className="text-gray-400 text-sm mt-1">

                        Admin Panel

                    </p>


                </div>



                {/* ================================================= */}
                {/* MENU */}
                {/* ================================================= */}


                <nav className="flex-1 p-4 space-y-2">


                    {menuItems.map((item) => {


                        const Icon = item.icon;


                        return (


                            <NavLink


                                key={item.path}


                                to={item.path}


                                end={

                                    item.path === "/admin"

                                }


                                className={({ isActive }) =>


                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${

                                        isActive

                                            ? "bg-white text-black"

                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"

                                    }`

                                }


                            >


                                <Icon size={20} />


                                <span>

                                    {item.name}

                                </span>


                            </NavLink>


                        );

                    })}


                </nav>



                {/* ================================================= */}
                {/* LOGOUT */}
                {/* ================================================= */}


                <div className="p-4 border-t border-gray-800">


                    <button


                        onClick={handleLogout}


                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"


                    >


                        <LogOut size={20} />


                        Logout


                    </button>


                </div>


            </aside>



            {/* ================================================= */}
            {/* MAIN CONTENT */}
            {/* ================================================= */}


            <main className="flex-1 min-w-0">


                {/* ================================================= */}
                {/* TOP BAR */}
                {/* ================================================= */}


                <header className="h-20 bg-white border-b flex items-center justify-between px-8">


                    {/* WELCOME */}


                    <div>


                        <p className="text-gray-500 text-sm">


                            Welcome back,


                        </p>


                        <h2 className="font-bold text-xl">


                            {admin.full_name}


                        </h2>


                    </div>



                    {/* ================================================= */}
                    {/* ADMIN PROFILE */}
                    {/* ================================================= */}


                    <Link


                        to="/admin/profile"


                        className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"


                        title="Admin Profile"


                    >


                        <CircleUserRound size={24} />


                    </Link>


                </header>



                {/* ================================================= */}
                {/* PAGE CONTENT */}
                {/* ================================================= */}


                <div>


                    <Outlet />


                </div>


            </main>


        </div>

    );

}


export default AdminLayout;