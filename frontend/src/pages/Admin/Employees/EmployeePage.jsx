
import { useLocation, useOutletContext } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
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
    ClipboardList,
    RefreshCw
} from "lucide-react";

const API_URL = "http://localhost:5000/api/admin/employee-tasks";

const pages = {
    "/employee": {
        title: "Dashboard",
        description: "View your work overview and notifications.",
        icon: LayoutDashboard
    },
    "/employee/products": {
        title: "Shop Products",
        description: "Browse clothing products, styles, sizes, colors and prices.",
        icon: ShoppingBag
    },
    "/employee/inventory": {
        title: "Inventory",
        description: "View stock availability and low-stock products.",
        icon: Package
    },
    "/employee/orders": {
        title: "Orders",
        description: "View orders and their current status.",
        icon: ShoppingCart
    },
    "/employee/schedule": {
        title: "My Schedule",
        description: "View your assigned shifts and working hours.",
        icon: CalendarDays
    },
    "/employee/leave-requests": {
        title: "Leave Requests",
        description: "Submit leave requests and track approval status.",
        icon: CalendarOff
    },
    "/employee/salary": {
        title: "Salary & Penalties",
        description: "Review salary information, deductions and adjustment requests.",
        icon: Wallet
    },
    "/employee/performance": {
        title: "My Performance",
        description: "Review your performance evaluations and work history.",
        icon: ClipboardCheck
    },
    "/employee/profile": {
        title: "My Profile",
        description: "View your account and personal information.",
        icon: UserRound
    }
};

function formatDate(value) {
    if (!value) return "No deadline";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No deadline";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

const statusLabels = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
};

function EmployeeTasks({ employee }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const loadTasks = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setTasks(
                Array.isArray(response.data?.tasks)
                    ? response.data.tasks
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load employee tasks:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load tasks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const updateStatus = async (task, status) => {
        const token = localStorage.getItem("token");

        setUpdatingId(task.id);
        setError("");

        try {
            await axios.patch(
                `${API_URL}/${task.id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await loadTasks();
        } catch (err) {
            console.error(
                "Failed to update task:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to update task status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const activeTasks = tasks.filter(
        task => !["COMPLETED", "CANCELLED"].includes(
            String(task.status || "").toUpperCase()
        )
    );

    const completedTasks = tasks.filter(
        task => String(task.status || "").toUpperCase() === "COMPLETED"
    );

    return (
        <section className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-3">
                        <ClipboardList size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            My Tasks
                        </h2>
                        <p className="text-sm text-gray-500">
                            Tasks assigned to you by Management
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={loadTasks}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Active Tasks</p>
                    <p className="mt-2 text-3xl font-bold">
                        {activeTasks.length}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Completed Tasks</p>
                    <p className="mt-2 text-3xl font-bold">
                        {completedTasks.length}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    Loading tasks...
                </div>
            ) : tasks.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <ClipboardList
                        size={32}
                        className="mx-auto text-gray-400"
                    />
                    <h3 className="mt-3 font-semibold">
                        No tasks assigned yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Tasks assigned by Management will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(task => {
                        const status = String(
                            task.status || "PENDING"
                        ).toUpperCase();

                        const canUpdate = ![
                            "COMPLETED",
                            "CANCELLED"
                        ].includes(status);

                        return (
                            <article
                                key={task.id}
                                className="rounded-xl border bg-white p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {task.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Assigned by: {
                                                task.assigned_by_name || "Management"
                                            }
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                        {statusLabels[status] || status}
                                    </span>
                                </div>

                                <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
                                    {task.description || "No description provided."}
                                </p>

                                <div className="mt-4 text-sm text-gray-500">
                                    Due date: {formatDate(task.due_date)}
                                </div>

                                {canUpdate && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {status === "PENDING" && (
                                            <button
                                                type="button"
                                                disabled={updatingId === task.id}
                                                onClick={() => updateStatus(task, "IN_PROGRESS")}
                                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                {updatingId === task.id
                                                    ? "Updating..."
                                                    : "Start Task"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            disabled={updatingId === task.id}
                                            onClick={() => updateStatus(task, "COMPLETED")}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function EmployeePage() {
    const location = useLocation();
    const { employee, department } = useOutletContext();

    const page = pages[location.pathname] || pages["/employee"];
    const Icon = page.icon;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {page.title}
                </h1>

                <p className="mt-2 text-gray-500">
                    {page.description}
                </p>
            </div>

            <div className="rounded-xl border bg-white p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-3">
                        <Icon size={24} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">
                            {page.title}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {employee.full_name} · {
                                department === "SALES"
                                    ? "Sales"
                                    : "Customer Service"
                            }
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-gray-600">
                    {page.description}
                </p>
            </div>

            {location.pathname === "/employee" && (
                <EmployeeTasks employee={employee} />
            )}
        </div>
    );
}

export default EmployeePage;
