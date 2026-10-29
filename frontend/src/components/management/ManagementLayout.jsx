
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const menuItems = [
    { label: "Dashboard", path: "/management?tab=dashboard" },
    { label: "Task Management", path: "/management?tab=tasks" },
    { label: "Work Schedule", path: "/management?tab=schedule" },
];

export default function ManagementLayout() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#f6f7fb] text-gray-900">
            <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-white border-r border-gray-200">
                <div className="border-b border-gray-100 px-6 py-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Clothing Shop
                    </h1>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                        Management Portal
                    </p>
                </div>

                <nav className="flex-1 space-y-2 p-4">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-100 p-4">
                    <p className="truncate px-3 text-sm font-semibold">
                        {user.full_name || user.fullName || "Management"}
                    </p>
                    <p className="px-3 pt-1 text-xs text-gray-500">
                        Management account
                    </p>

                    <button
                        onClick={handleLogout}
                        className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <div className="min-h-screen md:ml-64">
                <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-6 backdrop-blur">
                    <div>
                        <p className="text-sm text-gray-500">
                            Clothing Shop / Management
                        </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold">
                        MANAGEMENT
                    </span>
                </header>

                <main className="p-5 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
