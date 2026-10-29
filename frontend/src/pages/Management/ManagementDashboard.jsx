import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const TASK_API = "http://localhost:5000/api/admin/employee-tasks";
const EMPLOYEE_API = "http://localhost:5000/api/employees";
const SCHEDULE_API = "http://localhost:5000/api/work-schedules";

const statusLabels = {
    PENDING: "Pending",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

function getArray(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.schedules)) return data.schedules;
    return [];
}

function getErrorMessage(error) {
    return error.response?.data?.message ||
        error.message ||
        "Something went wrong.";
}

function formatDate(value) {
    if (!value) return "-";

    const date = String(value).slice(0, 10);
    const parts = date.split("-");

    return parts.length === 3
        ? `${parts[2]}/${parts[1]}/${parts[0]}`
        : date;
}

function formatTime(value) {
    if (!value) return "--:--";

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(11, 19);
    }

    return String(value).slice(0, 8);
}

export default function ManagementDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get("tab") || "dashboard";

    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scheduleSaving, setScheduleSaving] = useState(false);

    const [error, setError] = useState("");
    const [scheduleError, setScheduleError] = useState("");
    const [message, setMessage] = useState("");

    // Form giao việc
    const [form, setForm] = useState({
        title: "",
        description: "",
        assigned_to: "",
        due_date: "",
    });

    // Form tạo lịch làm
    const [scheduleForm, setScheduleForm] = useState({
        employee_id: "",
        schedule_date: "",
        start_time: "",
        end_time: "",
        shift_name: "",
        note: "",
    });

    const api = useCallback(() => axios.create({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    }), []);

    // Tải dữ liệu
    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        setScheduleError("");

        const client = api();

        const [taskResult, employeeResult, scheduleResult] =
            await Promise.allSettled([
                client.get(TASK_API),
                client.get(EMPLOYEE_API),
                client.get(SCHEDULE_API),
            ]);

        if (taskResult.status === "fulfilled") {
            setTasks(getArray(taskResult.value.data, "tasks"));
        } else {
            setError(getErrorMessage(taskResult.reason));
        }

        if (employeeResult.status === "fulfilled") {
            setEmployees(getArray(employeeResult.value.data, "employees"));
        } else {
            setError((previous) =>
                previous
                    ? `${previous} | ${getErrorMessage(employeeResult.reason)}`
                    : getErrorMessage(employeeResult.reason)
            );
        }

        if (scheduleResult.status === "fulfilled") {
            setSchedules(getArray(scheduleResult.value.data, "schedules"));
        } else {
            setScheduleError(getErrorMessage(scheduleResult.reason));
        }

        setLoading(false);
    }, [api]);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        loadData();
    }, [loadData]);

    // Xử lý form giao việc
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
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
            const response = await api().post(TASK_API, {
                title: form.title.trim(),
                description: form.description.trim(),
                assigned_to: Number(form.assigned_to),
                due_date: form.due_date || null,
            });

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

    // Xử lý form tạo lịch làm
    const handleScheduleChange = (event) => {
        const { name, value } = event.target;

        setScheduleForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleScheduleSubmit = async (event) => {
        event.preventDefault();

        setScheduleError("");
        setError("");
        setMessage("");

        if (
            !scheduleForm.employee_id ||
            !scheduleForm.schedule_date ||
            !scheduleForm.start_time ||
            !scheduleForm.end_time ||
            !scheduleForm.shift_name.trim()
        ) {
            setScheduleError(
                "Please complete all required schedule fields."
            );
            return;
        }

        if (scheduleForm.end_time <= scheduleForm.start_time) {
            setScheduleError(
                "End time must be later than start time."
            );
            return;
        }

        setScheduleSaving(true);

        try {
            const response = await api().post(SCHEDULE_API, {
                employee_id: Number(scheduleForm.employee_id),
                schedule_date: scheduleForm.schedule_date,
                start_time: scheduleForm.start_time,
                end_time: scheduleForm.end_time,
                shift_name: scheduleForm.shift_name.trim(),
                note: scheduleForm.note.trim() || null,
            });

            setMessage(
                response.data?.message ||
                "Work schedule created successfully."
            );

            setScheduleForm({
                employee_id: "",
                schedule_date: "",
                start_time: "",
                end_time: "",
                shift_name: "",
                note: "",
            });

            await loadData();
        } catch (err) {
            setScheduleError(getErrorMessage(err));
        } finally {
            setScheduleSaving(false);
        }
    };

    // Hủy công việc
    const handleCancel = async (taskId) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this task?"
            )
        ) {
            return;
        }

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
        (task) =>
            ["PENDING", "IN_PROGRESS"].includes(task.status)
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "COMPLETED"
    ).length;

    const stats = [
        { label: "Employees", value: employees.length },
        { label: "Active tasks", value: activeTasks },
        { label: "Completed tasks", value: completedTasks },
    ];

    const tabs = [
        { id: "dashboard", label: "Dashboard" },
        { id: "tasks", label: "Task Management" },
        { id: "schedule", label: "Work Schedule" },
    ];

   const regularEmployees = employees.filter((employee) => {
    return Boolean(
        employee.employee_code || employee.employeeCode
    );
});

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Tiêu đề */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        MANAGEMENT PORTAL
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        {tabs.find((tab) => tab.id === currentTab)?.label
                            || "Dashboard"}
                    </h1>
                </div>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                    Refresh data
                </button>
            </div>

            {/* Thanh điều hướng */}
            <nav className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSearchParams({ tab: tab.id })}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                            currentTab === tab.id
                                ? "bg-black text-white"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Thông báo lỗi */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Thông báo thành công */}
            {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {message}
                </div>
            )}

            {/* DASHBOARD */}
            {currentTab === "dashboard" && (
                <>
                    <section className="grid gap-4 sm:grid-cols-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-gray-200 bg-white p-6"
                            >
                                <p className="text-sm text-gray-500">
                                    {stat.label}
                                </p>

                                <p className="mt-3 text-3xl font-bold">
                                    {loading ? "—" : stat.value}
                                </p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <h2 className="text-xl font-bold">
                            Overview
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Use Task Management to assign and track tasks,
                            or Work Schedule to manage employee shifts.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={() =>
                                    setSearchParams({ tab: "tasks" })
                                }
                                className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                            >
                                Open Task Management
                            </button>

                            <button
                                onClick={() =>
                                    setSearchParams({ tab: "schedule" })
                                }
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                            >
                                View Work Schedule
                            </button>
                        </div>
                    </section>
                </>
            )}

            {/* TASK MANAGEMENT */}
            {currentTab === "tasks" && (
                <>
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <h2 className="text-xl font-bold">
                            Assign a task
                        </h2>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-5 grid gap-4 md:grid-cols-2"
                        >
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={200}
                                required
                                placeholder="Task title"
                                className="rounded-xl border border-gray-300 px-4 py-3"
                            />

                            <select
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleChange}
                                required
                                className="rounded-xl border border-gray-300 bg-white px-4 py-3"
                            >
                                <option value="">
                                    Select employee
                                </option>

                                {employees.map((employee) => {
                                    const id =
                                        employee.id ?? employee.user_id;

                                    return (
                                        <option key={id} value={id}>
                                            {employee.full_name ||
                                                employee.fullName ||
                                                employee.employee_code ||
                                                `Employee #${id}`}
                                        </option>
                                    );
                                })}
                            </select>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Task description"
                                className="rounded-xl border border-gray-300 px-4 py-3 md:col-span-2"
                            />

                            <input
                                type="date"
                                name="due_date"
                                value={form.due_date}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-300 px-4 py-3"
                            />

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    loading ||
                                    employees.length === 0
                                }
                                className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {saving ? "Assigning..." : "Assign task"}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <h2 className="text-xl font-bold">
                            Task list
                        </h2>

                        {loading ? (
                            <p className="py-8 text-gray-500">
                                Loading tasks...
                            </p>
                        ) : tasks.length === 0 ? (
                            <p className="py-8 text-gray-500">
                                No tasks yet.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {tasks.map((task) => (
                                    <article
                                        key={task.id}
                                        className="rounded-xl border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {task.title}
                                                </h3>

                                                {task.description && (
                                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <p className="mt-2 text-xs text-gray-500">
                                                    Assigned to:{" "}
                                                    {task.employee_name ||
                                                        `Employee #${task.assigned_to}`}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Due:{" "}
                                                    {task.due_date
                                                        ? String(
                                                            task.due_date
                                                        ).slice(0, 10)
                                                        : "No deadline"}
                                                </p>
                                            </div>

                                            <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                                {statusLabels[task.status] ||
                                                    task.status}
                                            </span>
                                        </div>

                                        {task.status !== "CANCELLED" &&
                                            task.status !== "COMPLETED" && (
                                                <button
                                                    onClick={() =>
                                                        handleCancel(task.id)
                                                    }
                                                    className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Cancel task
                                                </button>
                                            )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* WORK SCHEDULE */}
            {currentTab === "schedule" && (
                <div className="space-y-6">
                    {/* FORM TẠO LỊCH */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold">
                                Create Work Schedule
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Create a work schedule for an employee.
                            </p>
                        </div>

                        {scheduleError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {scheduleError}
                            </div>
                        )}

                        <form
                            onSubmit={handleScheduleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            {/* Chọn nhân viên */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                Employee <span className="text-red-600">*</span>

                                <select
                                    name="employee_id"
                                    value={scheduleForm.employee_id}
                                    onChange={handleScheduleChange}
                                    required
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal"
                                >
                                    <option value="">
                                        Select employee
                                    </option>

                                    {regularEmployees.map((employee) => {
                                        const id =
                                            employee.id ?? employee.user_id;

                                        return (
                                            <option key={id} value={id}>
                                                {employee.full_name ||
    employee.fullName ||
    employee.name ||
    employee.employee_code ||
    employee.employeeCode ||
    `Employee #${id}`}

                                                {employee.employee_code
                                                    ? ` (${employee.employee_code})`
                                                    : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>

                            {/* Ngày làm */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                Work date <span className="text-red-600">*</span>

                                <input
                                    type="date"
                                    name="schedule_date"
                                    value={scheduleForm.schedule_date}
                                    onChange={handleScheduleChange}
                                    required
                                    className="rounded-xl border border-gray-300 px-4 py-3 font-normal"
                                />
                            </label>

                            {/* Giờ bắt đầu */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                Start time <span className="text-red-600">*</span>

                                <input
                                    type="time"
                                    name="start_time"
                                    value={scheduleForm.start_time}
                                    onChange={handleScheduleChange}
                                    required
                                    className="rounded-xl border border-gray-300 px-4 py-3 font-normal"
                                />
                            </label>

                            {/* Giờ kết thúc */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                End time <span className="text-red-600">*</span>

                                <input
                                    type="time"
                                    name="end_time"
                                    value={scheduleForm.end_time}
                                    onChange={handleScheduleChange}
                                    required
                                    className="rounded-xl border border-gray-300 px-4 py-3 font-normal"
                                />
                            </label>

                            {/* Ca làm */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                Shift <span className="text-red-600">*</span>

                                <input
                                    name="shift_name"
                                    value={scheduleForm.shift_name}
                                    onChange={handleScheduleChange}
                                    required
                                    maxLength={50}
                                    placeholder="Morning, Afternoon, Evening..."
                                    className="rounded-xl border border-gray-300 px-4 py-3 font-normal"
                                />
                            </label>

                            {/* Ghi chú */}
                            <label className="grid gap-2 text-sm font-medium text-gray-700">
                                Note

                                <input
                                    name="note"
                                    value={scheduleForm.note}
                                    onChange={handleScheduleChange}
                                    maxLength={500}
                                    placeholder="Optional note"
                                    className="rounded-xl border border-gray-300 px-4 py-3 font-normal"
                                />
                            </label>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={
                                        scheduleSaving ||
                                        loading ||
                                        regularEmployees.length === 0
                                    }
                                    className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {scheduleSaving
                                        ? "Creating schedule..."
                                        : "Create schedule"}
                                </button>

                                {regularEmployees.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-700">
                                        No employees with the EMPLOYEE role
                                        were returned by the employees API.
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* DANH SÁCH LỊCH LÀM */}
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold">
                                Employee Work Schedule
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                View schedules you are permitted to access.
                            </p>
                        </div>

                        {scheduleError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                Could not load schedules: {scheduleError}
                            </div>
                        )}

                        {loading ? (
                            <p className="py-8 text-center text-gray-500">
                                Loading schedules...
                            </p>
                        ) : schedules.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">
                                No work schedules found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[750px] text-left text-sm">
                                    <thead className="border-b bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3">
                                                Employee
                                            </th>
                                            <th className="px-4 py-3">
                                                Date
                                            </th>
                                            <th className="px-4 py-3">
                                                Working Hours
                                            </th>
                                            <th className="px-4 py-3">
                                                Shift
                                            </th>
                                            <th className="px-4 py-3">
                                                Status
                                            </th>
                                            <th className="px-4 py-3">
                                                Note
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {schedules.map((schedule) => (
                                            <tr
                                                key={schedule.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {schedule.employee_name ||
                                                        `Employee #${schedule.employee_id}`}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {formatDate(
                                                        schedule.schedule_date
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {formatTime(schedule.start_time)}
                                                    {" - "}
                                                    {formatTime(schedule.end_time)}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {schedule.shift_name || "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {schedule.status || "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {schedule.note || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}