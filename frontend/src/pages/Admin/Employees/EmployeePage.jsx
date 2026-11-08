
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

const SCHEDULE_API = "http://localhost:5000/api/work-schedules";

const PRODUCTS_API = "http://localhost:5000/api/products";

const ORDERS_API = "http://localhost:5000/api/orders";

const INVENTORY_API = "http://localhost:5000/api/products/inventory";

const LEAVE_REQUESTS_API = "http://localhost:5000/api/leave-requests";
function EmployeeSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSchedules = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(SCHEDULE_API, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data;

            setSchedules(
                Array.isArray(data)
                    ? data
                    : data.schedules || data.workSchedules || []
            );
        } catch (err) {
            console.error(
                "Failed to load work schedules:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load work schedules."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-US");
    };

    const formatTime = (value) => {
        if (!value) return "—";
        return String(value).slice(0, 5);
    };

    return (
        <section className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        My Work Schedule
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View your assigned work shifts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadSchedules}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    Loading work schedules...
                </div>
            ) : schedules.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <CalendarDays
                        size={32}
                        className="mx-auto text-gray-400"
                    />
                    <h3 className="mt-3 font-semibold text-gray-900">
                        No Work Schedules Available
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Your work schedules will appear here once they have been assigned.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3">Work Date</th>
                                <th className="px-5 py-3">Shift</th>
                                <th className="px-5 py-3">Start Time</th>
                                <th className="px-5 py-3">End Time</th>
                                <th className="px-5 py-3">Notes</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {schedules.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {formatDate(
                                            item.schedule_date ||
                                            item.work_date ||
                                            item.date
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {item.shift_name ||
                                            item.shift ||
                                            "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {formatTime(
                                            item.start_time ||
                                            item.startTime
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {formatTime(
                                            item.end_time ||
                                            item.endTime
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {item.note ||
                                            item.notes ||
                                            "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
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
function EmployeeProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get(PRODUCTS_API, {
                params: search.trim()
                    ? { search: search.trim() }
                    : {}
            });

            setProducts(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error(
                "Failed to load products:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const formatPrice = (price) =>
        Number(price || 0).toLocaleString("vi-VN") + " ₫";

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "";

        if (imageUrl.startsWith("http")) return imageUrl;

        return `http://localhost:5000${imageUrl}`;
    };

    return (
        <section className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Shop Products
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Browse products currently available in the store.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadProducts}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="rounded-xl border bg-white p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                />
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    Loading products...
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <ShoppingBag
                        size={32}
                        className="mx-auto text-gray-400"
                    />
                    <h3 className="mt-3 font-semibold text-gray-900">
                        No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No products are currently available.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Product ID</th>
                                <th className="px-5 py-3">Category</th>
                                <th className="px-5 py-3">Brand</th>
                                <th className="px-5 py-3">Price</th>
                                <th className="px-5 py-3">Stock</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img
                                                    src={getImageUrl(product.image_url)}
                                                    alt={product.product_name}
                                                    className="h-12 w-12 rounded-lg border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                    <ShoppingBag
                                                        size={20}
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                            )}

                                            <span className="font-medium text-gray-900">
                                                {product.product_name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        #{product.id}
                                    </td>

                                    <td className="px-5 py-4">
                                        {product.category_name || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        {product.brand || "—"}
                                    </td>

                                    <td className="px-5 py-4 font-medium">
                                        {formatPrice(product.price)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className={
                                            Number(product.stock) <= 0
                                                ? "font-semibold text-red-600"
                                                : Number(product.stock) <= 10
                                                    ? "font-semibold text-amber-600"
                                                    : "font-semibold text-green-600"
                                        }>
                                            {product.stock ?? 0}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && products.length > 0 && (
                <p className="text-sm text-gray-500">
                    Total: {products.length} products
                </p>
            )}
        </section>
    );
}

function EmployeeOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadOrders = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(ORDERS_API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setOrders(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error(
                "Failed to load orders:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const formatPrice = (value) =>
        Number(value || 0).toLocaleString("vi-VN") + " ₫";

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleString("vi-VN");
    };

    const getStatusStyle = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-700",
            CONFIRMED: "bg-blue-100 text-blue-700",
            PROCESSING: "bg-indigo-100 text-indigo-700",
            SHIPPING: "bg-purple-100 text-purple-700",
            DELIVERED: "bg-green-100 text-green-700",
            COMPLETED: "bg-green-100 text-green-700",
            CANCELLED: "bg-red-100 text-red-700"
        };

        return styles[String(status || "").toUpperCase()] ||
            "bg-gray-100 text-gray-700";
    };

    const filteredOrders = orders.filter((order) => {
        const keyword = search.trim().toLowerCase();

        const matchesSearch =
            String(order.id).includes(keyword) ||
            String(order.customer_name || "").toLowerCase().includes(keyword) ||
            String(order.customer_email || "").toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "ALL" ||
            String(order.status || "").toUpperCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <section className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Order Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View and track customer orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadOrders}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="mt-2 text-2xl font-bold">{orders.length}</p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <p className="mt-2 text-2xl font-bold">
                        {orders.filter(
                            order => String(order.status).toUpperCase() === "PENDING"
                        ).length}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Completed Orders</p>
                    <p className="mt-2 text-2xl font-bold">
                        {orders.filter(
                            order => ["COMPLETED", "DELIVERED"].includes(
                                String(order.status).toUpperCase()
                            )
                        ).length}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order ID, customer name or email..."
                    className="min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    Loading orders...
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <ShoppingCart size={32} className="mx-auto text-gray-400" />
                    <h3 className="mt-3 font-semibold text-gray-900">
                        No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No orders match your search.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3">Order ID</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Order Date</th>
                                <th className="px-5 py-3">Total Amount</th>
                                <th className="px-5 py-3">Payment Method</th>
                                <th className="px-5 py-3">Payment Status</th>
                                <th className="px-5 py-3">Order Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-semibold">
                                        #{order.id}
                                    </td>

                                    <td className="px-5 py-4">
                                        <p className="font-medium text-gray-900">
                                            {order.customer_name || "Unknown"}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {order.customer_email || "—"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        {formatDate(order.order_date)}
                                    </td>

                                    <td className="px-5 py-4 font-semibold">
                                        {formatPrice(order.total_amount)}
                                    </td>

                                    <td className="px-5 py-4">
                                        {order.payment_method || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        {order.payment_status || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(order.status)}`}>
                                            {order.status || "Unknown"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredOrders.length > 0 && (
                <p className="text-sm text-gray-500">
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
            )}
        </section>
    );
}


function EmployeeInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadInventory = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get(INVENTORY_API);

            setInventory(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error(
                "Failed to load inventory:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load inventory."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return "";

        if (imageUrl.startsWith("http")) return imageUrl;

        return `http://localhost:5000${imageUrl}`;
    };

    const filteredInventory = inventory.filter((item) => {
        const keyword = search.trim().toLowerCase();

        const matchesSearch =
            String(item.product_name || "").toLowerCase().includes(keyword) ||
            String(item.color_name || "").toLowerCase().includes(keyword) ||
            String(item.size || "").toLowerCase().includes(keyword) ||
            String(item.product_id || "").includes(keyword);

        const stock = Number(item.stock || 0);

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "OUT_OF_STOCK" && stock === 0) ||
            (statusFilter === "LOW_STOCK" && stock > 0 && stock <= 5) ||
            (statusFilter === "IN_STOCK" && stock > 5);

        return matchesSearch && matchesStatus;
    });

    const productIds = new Set(
        inventory.map(item => item.product_id)
    );

    const totalStock = inventory.reduce(
        (sum, item) => sum + Number(item.stock || 0),
        0
    );

    const lowStockCount = inventory.filter(
        item => Number(item.stock) > 0 && Number(item.stock) <= 5
    ).length;

    const outOfStockCount = inventory.filter(
        item => Number(item.stock) === 0
    ).length;

    const getStockStatus = (stock) => {
        if (Number(stock) <= 0) {
            return {
                label: "Out of Stock",
                className: "bg-red-100 text-red-700"
            };
        }

        if (Number(stock) <= 5) {
            return {
                label: "Low Stock",
                className: "bg-amber-100 text-amber-700"
            };
        }

        return {
            label: "In Stock",
            className: "bg-green-100 text-green-700"
        };
    };

    return (
        <section className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Inventory Overview
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View product variants and stock availability.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadInventory}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="mt-2 text-2xl font-bold">
                        {productIds.size}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Total Stock</p>
                    <p className="mt-2 text-2xl font-bold">
                        {totalStock.toLocaleString("vi-VN")}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Low Stock Variants</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">
                        {lowStockCount}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <p className="text-sm text-gray-500">Out of Stock Variants</p>
                    <p className="mt-2 text-2xl font-bold text-red-600">
                        {outOfStockCount}
                    </p>
                </div>
            </div>

            {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <Package
                        size={20}
                        className="mt-0.5 text-amber-600"
                    />

                    <div>
                        <p className="font-semibold text-amber-800">
                            Inventory Alert
                        </p>
                        <p className="mt-1 text-sm text-amber-700">
                            {outOfStockCount} variants are out of stock
                            and {lowStockCount} variants have low stock.
                            Please notify Management.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product, color, size or ID..."
                    className="min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                >
                    <option value="ALL">All Stock Status</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    Loading inventory...
                </div>
            ) : filteredInventory.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center">
                    <Package
                        size={32}
                        className="mx-auto text-gray-400"
                    />
                    <h3 className="mt-3 font-semibold text-gray-900">
                        No inventory found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No variants match your search or filter.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full min-w-[950px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">Color</th>
                                <th className="px-5 py-3">Size</th>
                                <th className="px-5 py-3">Stock</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {filteredInventory.map((item, index) => {
                                const status = getStockStatus(item.stock);

                                return (
                                    <tr
                                        key={item.variant_id || `${item.product_id}-${item.color_id}-${item.size_id}-${index}`}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.product_image ? (
                                                    <img
                                                        src={getImageUrl(item.product_image)}
                                                        alt={item.product_name}
                                                        className="h-12 w-12 rounded-lg border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                        <ShoppingBag
                                                            size={20}
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.product_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Product #{item.product_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {item.color_image && (
                                                    <img
                                                        src={getImageUrl(item.color_image)}
                                                        alt={item.color_name}
                                                        className="h-9 w-9 rounded-md border object-cover"
                                                    />
                                                )}
                                                <span>
                                                    {item.color_name || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.size || "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="font-semibold">
                                                {Number(item.stock || 0)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && filteredInventory.length > 0 && (
                <p className="text-sm text-gray-500">
                    Showing {filteredInventory.length} variants
                </p>
            )}
        </section>
    );
}
function EmployeeLeaveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        start_date: "",
        end_date: "",
        reason: ""
    });

    const loadRequests = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(
                `${LEAVE_REQUESTS_API}/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setRequests(response.data?.leaveRequests || []);
        } catch (err) {
            console.error(
                "Failed to load leave requests:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load leave requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        setError("");
        setSuccess("");

        if (form.end_date < form.start_date) {
            setError("End date must be on or after start date.");
            return;
        }

        setSubmitting(true);

        try {
            await axios.post(
                LEAVE_REQUESTS_API,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess("Your leave request has been submitted successfully.");

            setForm({
                start_date: "",
                end_date: "",
                reason: ""
            });

            await loadRequests();
        } catch (err) {
            console.error(
                "Failed to submit leave request:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Unable to submit leave request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-GB");
    };

    const getStatusStyle = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-700",
            APPROVED: "bg-green-100 text-green-700",
            REJECTED: "bg-red-100 text-red-700"
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <section className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        My Leave Requests
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Submit leave requests and track their approval status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadRequests}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border bg-white p-5"
            >
                <h3 className="font-semibold text-gray-900">
                    Submit a Leave Request
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Start Date
                        </label>
                        <input
                            type="date"
                            required
                            value={form.start_date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    start_date: e.target.value
                                })
                            }
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            End Date
                        </label>
                        <input
                            type="date"
                            required
                            min={form.start_date || undefined}
                            value={form.end_date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    end_date: e.target.value
                                })
                            }
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Reason
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={form.reason}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                reason: e.target.value
                            })
                        }
                        placeholder="Enter your leave request reason..."
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit Request"}
                </button>
            </form>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                    Leave Request History
                </h3>

                {loading ? (
                    <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                        Loading leave requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="rounded-xl border bg-white p-8 text-center">
                        <CalendarOff
                            size={32}
                            className="mx-auto text-gray-400"
                        />
                        <h3 className="mt-3 font-semibold text-gray-900">
                            No Leave Requests
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Your submitted leave requests will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-5 py-3">Start Date</th>
                                    <th className="px-5 py-3">End Date</th>
                                    <th className="px-5 py-3">Reason</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Review Note</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {requests.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-4">
                                            {formatDate(item.start_date)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {formatDate(item.end_date)}
                                        </td>
                                        <td className="max-w-xs whitespace-pre-wrap px-5 py-4">
                                            {item.reason}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="max-w-xs whitespace-pre-wrap px-5 py-4 text-gray-600">
                                            {item.review_note || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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

{location.pathname === "/employee/schedule" && (
    <EmployeeSchedule />
)}
{location.pathname === "/employee/products" && (
    <EmployeeProducts />
)}
{location.pathname === "/employee/orders" && (
    <EmployeeOrders />
)}
{location.pathname === "/employee/inventory" && (
    <EmployeeInventory />
)}
{location.pathname === "/employee/leave-requests" && (
    <EmployeeLeaveRequests />
)}
        </div>
    );
}

export default EmployeePage;
