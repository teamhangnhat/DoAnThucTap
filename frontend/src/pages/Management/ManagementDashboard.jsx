
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const TASK_API = "http://localhost:5000/api/admin/employee-tasks";
const EMPLOYEE_API = "http://localhost:5000/api/employees";

const statusLabels = {
    PENDING: "Pending",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

function getArray(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
}

function getErrorMessage(error) {
    return error.response?.data?.message || error.message ||
        "Something went wrong.";
}

export default function ManagementDashboard() {
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        assigned_to: "",
        due_date: "",
    });

    const token = localStorage.getItem("token");

    const api = useCallback(() => {
        return axios.create({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const client = api();

            const [taskResponse, employeeResponse] = await Promise.all([
                client.get(TASK_API),
                client.get(EMPLOYEE_API),
            ]);

            setTasks(getArray(taskResponse.data, "tasks"));

            const employeeList = getArray(
                employeeResponse.data,
                "employees"
            );

            setEmployees(employeeList);
        } catch (err) {
            setError(
                `${getErrorMessage(err)} Check that you are logged in with a Management account and that both APIs are available.`
            );
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        loadData();
    }, [token, loadData]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!form.title.trim() || !form.assigned_to) {
            setError("Please enter a task title and select an employee.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                assigned_to: Number(form.assigned_to),
                due_date: form.due_date || null,
            };

            const response = await api().post(TASK_API, payload);

            setMessage(
                response.data?.message || "Task assigned successfully."
            );

            setForm({
                title: "",
                description: "",
                assigned_to: "",
                due_date: "",
            });

            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this task?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            const response = await api().patch(
                `${TASK_API}/${taskId}/cancel`
            );

            setMessage(
                response.data?.message || "Task cancelled successfully."
            );

            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const activeTasks = tasks.filter(
        (task) => ["PENDING", "IN_PROGRESS"].includes(task.status)
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "COMPLETED"
    ).length;

    const stats = [
        { label: "Employees", value: employees.length },
        { label: "Active tasks", value: activeTasks },
        { label: "Completed tasks", value: completedTasks },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        MANAGEMENT OVERVIEW
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Assign tasks and monitor employee progress.
                    </p>
                </div>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                    Refresh data
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-gray-200 bg-white p-6"
                    >
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="mt-3 text-3xl font-bold">
                            {loading ? "—" : stat.value}
                        </p>
                    </div>
                ))}
            </section>

            <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">Assign a task</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Create a task for an employee.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Task title
                            </label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={200}
                                required
                                placeholder="Enter task title"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe the task..."
                                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Assign to employee
                            </label>
                            <select
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                            >
                                <option value="">Select an employee</option>
                                {employees.map((employee) => (
                                    <option
                                        key={employee.id ?? employee.user_id}
                                        value={employee.id ?? employee.user_id}
                                    >
                                        {employee.full_name ||
                                            employee.fullName ||
                                            employee.employee_code ||
                                            `Employee #${employee.id ?? employee.user_id}`}
                                        {employee.department
                                            ? ` — ${employee.department}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {employees.length === 0 && !loading && (
                                <p className="mt-2 text-xs text-amber-700">
                                    No employees were returned by the employee API.
                                    Check its response format and permissions.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Due date
                            </label>
                            <input
                                type="date"
                                name="due_date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving || loading || employees.length === 0}
                            className="w-full rounded-xl bg-black px-5 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Assigning..." : "Assign task"}
                        </button>
                    </form>
                </div>

                <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">
                                Task management
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Review assigned work and current progress.
                            </p>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                            {tasks.length} tasks
                        </span>
                    </div>

                    {loading ? (
                        <p className="py-10 text-center text-sm text-gray-500">
                            Loading data...
                        </p>
                    ) : tasks.length === 0 ? (
                        <div className="rounded-xl bg-gray-50 px-5 py-12 text-center">
                            <p className="font-semibold">No tasks yet</p>
                            <p className="mt-2 text-sm text-gray-500">
                                Create a task using the form.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <article
                                    key={task.id}
                                    className="rounded-xl border border-gray-200 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="break-words font-semibold">
                                                {task.title}
                                            </h3>

                                            {task.description && (
                                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-600">
                                                    {task.description}
                                                </p>
                                            )}

                                            <p className="mt-3 text-xs text-gray-500">
                                                Assigned to:{" "}
                                                {task.employee_name ||
                                                    `Employee #${task.assigned_to}`}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Due:{" "}
                                                {task.due_date
                                                    ? String(task.due_date).slice(0, 10)
                                                    : "No deadline"}
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                            {statusLabels[task.status] ||
                                                task.status}
                                        </span>
                                    </div>

                                    {task.status !== "CANCELLED" &&
                                        task.status !== "COMPLETED" && (
                                            <button
                                                onClick={() => handleCancel(task.id)}
                                                className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Cancel task
                                            </button>
                                        )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <div className="text-sm text-gray-500">
                Employee work status will be updated through the Employee portal.
            </div>
        </div>
    );
}
