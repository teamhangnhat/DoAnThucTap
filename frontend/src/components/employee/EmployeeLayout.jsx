
import {
    NavLink,
    Outlet,
    Link,
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    ShoppingCart,
    CalendarDays,
    CalendarOff,
    Wallet,
    ClipboardCheck,
    UserRound,
    MessageCircle,
    LogOut,
    CircleUserRound
} from "lucide-react";

import { useEffect, useState } from "react";

function EmployeeLayout() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [department, setDepartment] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            const role = String(user.role || "").trim().toUpperCase();
            const userDepartment = String(user.department || "")
                .trim()
                .toUpperCase();

            if (
                role !== "EMPLOYEE" ||
                !["SALES", "CUSTOMER SERVICE", "CUSTOMER SUPPORT", "CSKH"]
                    .includes(userDepartment)
            ) {
                navigate("/", { replace: true });
                return;
            }

            setEmployee(user);
            setDepartment(
                userDepartment === "SALES" ? "SALES" : "CUSTOMER_SERVICE"
            );
        } catch (error) {
            console.error("Invalid employee data:", error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("redirectAfterLogin");

        navigate("/login", { replace: true });
    };

    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading employee portal...</p>
            </div>
        );
    }

    const menuItems = [
        {
            name: "Dashboard",
            path: "/employee",
            icon: LayoutDashboard,
            end: true
        },
        {
            name: "Shop Products",
            path: "/employee/products",
            icon: ShoppingBag
        },
        {
            name: "Inventory",
            path: "/employee/inventory",
            icon: Package
        },
        {
            name: "Orders",
            path: "/employee/orders",
            icon: ShoppingCart
        },
        {
            name: "My Schedule",
            path: "/employee/schedule",
            icon: CalendarDays
        },
        {
            name: "Leave Requests",
            path: "/employee/leave-requests",
            icon: CalendarOff
        },
        {
            name: "Salary & Penalties",
            path: "/employee/salary",
            icon: Wallet
        },
        {
            name: "My Performance",
            path: "/employee/performance",
            icon: ClipboardCheck
        },
        {
            name: "My Profile",
            path: "/employee/profile",
            icon: UserRound
        }
    ];

    if (department === "CUSTOMER_SERVICE") {
        menuItems.splice(4, 0, {
            name: "Customer Chat",
            path: "/employee/chat",
            icon: MessageCircle
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside className="w-64 shrink-0 bg-black text-white min-h-screen flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold">DK CLOTHING</h1>

                    <p className="text-gray-400 text-sm mt-1">
                        {department === "SALES"
                            ? "Sales Portal"
                            : "Customer Service Portal"}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end || false}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                        isActive
                                            ? "bg-white text-black"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

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

            <main className="flex-1 min-w-0">
                <header className="h-20 bg-white border-b flex items-center justify-between px-8">
                    <div>
                        <p className="text-gray-500 text-sm">
                            Welcome back,
                        </p>

                        <h2 className="font-bold text-xl">
                            {employee.full_name}
                        </h2>
                    </div>

                    <Link
                        to="/employee/profile"
                        className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                        title="My Profile"
                    >
                        <CircleUserRound size={24} />
                    </Link>
                </header>

                <div className="p-6">
                    <Outlet context={{ employee, department }} />
                </div>
            </main>
        </div>
    );
}

export default EmployeeLayout;
