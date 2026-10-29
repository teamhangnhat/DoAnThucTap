
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import {
    getEmployees,
    getScheduleEmployees
} from "../../../services/admin/employeeService";

import {
    getWorkSchedules,
    createWorkSchedule,
    updateWorkSchedule,
    cancelWorkSchedule,
    deleteWorkSchedule
} from "../../../services/admin/workScheduleService";

const EmployeeManagement = () => {
    const navigate = useNavigate();

    // Employee states
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // Work schedule states
    const [scheduleEmployees, setScheduleEmployees] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState("");
    const [scheduleMessage, setScheduleMessage] = useState("");
    const [editingScheduleId, setEditingScheduleId] = useState(null);

    const [scheduleForm, setScheduleForm] = useState({
        employee_id: "",
        schedule_date: "",
        start_time: "",
        end_time: "",
        shift_name: "",
        note: ""
    });

    // Load employees
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getEmployees();
                setEmployees(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load employees:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load employees."
                );
            } finally {
                setLoading(false);
            }
        };

        loadEmployees();
    }, []);

    // Load employees available for scheduling and schedules
    const loadScheduleData = async () => {
        try {
            setScheduleLoading(true);
            setScheduleError("");

            const [employeeData, scheduleData] = await Promise.all([
                getScheduleEmployees(),
                getWorkSchedules()
            ]);

            setScheduleEmployees(
                Array.isArray(employeeData) ? employeeData : []
            );

            setSchedules(
                Array.isArray(scheduleData)
                    ? scheduleData
                    : Array.isArray(scheduleData?.schedules)
                        ? scheduleData.schedules
                        : []
            );
        } catch (err) {
            console.error("Failed to load schedule data:", err);

            setScheduleError(
                err.response?.data?.message ||
                "Failed to load work schedules."
            );
        } finally {
            setScheduleLoading(false);
        }
    };

    useEffect(() => {
        loadScheduleData();
    }, []);

    // Employee statistics
    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
        (employee) =>
            String(employee.status || "").toUpperCase() === "ACTIVE"
    ).length;

    const salesEmployees = employees.filter(
        (employee) =>
            String(employee.department || "").toLowerCase() === "sales"
    ).length;

    const customerServiceEmployees = employees.filter(
        (employee) =>
            String(employee.department || "").toLowerCase() ===
            "customer service"
    ).length;

    // Filter employees
    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                employee.full_name?.toLowerCase().includes(search) ||
                employee.email?.toLowerCase().includes(search) ||
                employee.phone?.toLowerCase().includes(search) ||
                employee.employee_code?.toLowerCase().includes(search);

            const matchesDepartment =
                departmentFilter === "All" ||
                employee.department === departmentFilter;

            const employeeStatus = String(
                employee.status || ""
            ).toUpperCase();

            const matchesStatus =
                statusFilter === "All" ||
                employeeStatus === statusFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );
        });
    }, [
        employees,
        searchTerm,
        departmentFilter,
        statusFilter
    ]);

    // Format date
    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-GB");
    };

    // Format date returned by SQL Server
    const formatScheduleDate = (date) => {
        if (!date) return "-";

        const value = String(date).slice(0, 10);
        const parts = value.split("-");

        if (parts.length !== 3) return value;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // Status badge
    const getStatusClass = (status) => {
        const normalizedStatus = String(
            status || ""
        ).toUpperCase();

        if (normalizedStatus === "ACTIVE") {
            return "bg-green-100 text-green-700";
        }

        if (normalizedStatus === "INACTIVE") {
            return "bg-gray-100 text-gray-600";
        }

        return "bg-yellow-100 text-yellow-700";
    };

    // Schedule form change
    const handleScheduleFormChange = (e) => {
        const { name, value } = e.target;

        setScheduleForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset schedule form
    const resetScheduleForm = () => {
        setEditingScheduleId(null);

        setScheduleForm({
            employee_id: "",
            schedule_date: "",
            start_time: "",
            end_time: "",
            shift_name: "",
            note: ""
        });
    };

    // Create or update schedule
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();

        setScheduleError("");
        setScheduleMessage("");

        if (
            !scheduleForm.employee_id ||
            !scheduleForm.schedule_date ||
            !scheduleForm.start_time ||
            !scheduleForm.end_time
        ) {
            setScheduleError(
                "Please select an employee, date, start time and end time."
            );
            return;
        }

        if (scheduleForm.start_time >= scheduleForm.end_time) {
            setScheduleError(
                "End time must be later than start time."
            );
            return;
        }

        try {
            const payload = {
                ...scheduleForm,
                employee_id: Number(scheduleForm.employee_id)
            };

            if (editingScheduleId) {
                await updateWorkSchedule(
                    editingScheduleId,
                    payload
                );

                setScheduleMessage(
                    "Work schedule updated successfully."
                );
            } else {
                await createWorkSchedule(payload);

                setScheduleMessage(
                    "Work schedule created successfully."
                );
            }

            resetScheduleForm();
            await loadScheduleData();
        } catch (err) {
            console.error("Failed to save schedule:", err);

            setScheduleError(
                err.response?.data?.message ||
                "Failed to save work schedule."
            );
        }
    };

    // Edit schedule
    const handleEditSchedule = (schedule) => {
        setScheduleError("");
        setScheduleMessage("");
        setEditingScheduleId(schedule.id);

        setScheduleForm({
            employee_id: String(schedule.employee_id),
            schedule_date: String(
                schedule.schedule_date || ""
            ).slice(0, 10),
            start_time: String(
                schedule.start_time || ""
            ).slice(0, 5),
            end_time: String(
                schedule.end_time || ""
            ).slice(0, 5),
            shift_name: schedule.shift_name || "",
            note: schedule.note || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Cancel schedule
    const handleCancelSchedule = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to cancel this schedule?"
            )
        ) {
            return;
        }

        try {
            setScheduleError("");
            setScheduleMessage("");

            await cancelWorkSchedule(id);

            setScheduleMessage(
                "Work schedule cancelled successfully."
            );

            await loadScheduleData();
        } catch (err) {
            console.error("Failed to cancel schedule:", err);

            setScheduleError(
                err.response?.data?.message ||
                "Failed to cancel work schedule."
            );
        }
    };

    // Delete schedule
    const handleDeleteSchedule = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this schedule?"
            )
        ) {
            return;
        }

        try {
            setScheduleError("");
            setScheduleMessage("");

            await deleteWorkSchedule(id);

            setScheduleMessage(
                "Work schedule deleted successfully."
            );

            if (editingScheduleId === id) {
                resetScheduleForm();
            }

            await loadScheduleData();
        } catch (err) {
            console.error("Failed to delete schedule:", err);

            setScheduleError(
                err.response?.data?.message ||
                "Failed to delete work schedule."
            );
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

           {/* Header */}
<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">
            Employee Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
            Manage employee information and account status
        </p>
    </div>

    <button
        type="button"
        onClick={() => navigate("/admin/employees/new")}
        className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
    >
        <UserPlus size={18} />
        Add New Employee
    </button>
</div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Employees
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {totalEmployees}
                            </h2>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="text-xl">👥</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Active Employees
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {activeEmployees}
                            </h2>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="text-xl">✓</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Sales
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {salesEmployees}
                            </h2>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-xl">💼</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Customer Service
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {customerServiceEmployees}
                            </h2>
                        </div>
                        <div className="w-11 h-11 rounded-lg bg-orange-100 flex items-center justify-center">
                            <span className="text-xl">🎧</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Schedule Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Work Schedule Management
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create, view and manage employee work schedules.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadScheduleData}
                        disabled={scheduleLoading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        {scheduleLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {scheduleError && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {scheduleError}
                    </div>
                )}

                {scheduleMessage && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        {scheduleMessage}
                    </div>
                )}

                <form
                    onSubmit={handleScheduleSubmit}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                name="employee_id"
                                value={scheduleForm.employee_id}
                                onChange={handleScheduleFormChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            >
                                <option value="">
                                    Select employee
                                </option>

                                {scheduleEmployees.map((employee) => (
                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.full_name}
                                        {" — "}
                                        {employee.employee_code || employee.role || "Employee"}
                                    </option>
                                ))}
                            </select>

                            {scheduleEmployees.length === 0 && !scheduleLoading && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No employees available for scheduling.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Work Date
                            </label>
                            <input
                                type="date"
                                name="schedule_date"
                                value={scheduleForm.schedule_date}
                                onChange={handleScheduleFormChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shift Name
                            </label>
                            <input
                                type="text"
                                name="shift_name"
                                value={scheduleForm.shift_name}
                                onChange={handleScheduleFormChange}
                                maxLength={50}
                                placeholder="e.g. Morning Shift"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="time"
                                name="start_time"
                                value={scheduleForm.start_time}
                                onChange={handleScheduleFormChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="time"
                                name="end_time"
                                value={scheduleForm.end_time}
                                onChange={handleScheduleFormChange}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note
                            </label>
                            <input
                                type="text"
                                name="note"
                                value={scheduleForm.note}
                                onChange={handleScheduleFormChange}
                                maxLength={500}
                                placeholder="Optional note"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={scheduleLoading || scheduleEmployees.length === 0}
                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {editingScheduleId
                                ? "Update Schedule"
                                : "Create Schedule"}
                        </button>

                        {editingScheduleId && (
                            <button
                                type="button"
                                onClick={resetScheduleForm}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {/* Schedule List */}
                <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-3">
                        Scheduled Shifts
                    </h3>

                    {scheduleLoading ? (
                        <div className="py-8 text-center text-sm text-gray-500">
                            Loading schedules...
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-500">
                            No schedules found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">

                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Employee
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Working Hours
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Shift
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {schedules.map((schedule) => (
                                        <tr
                                            key={schedule.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">
                                                    {schedule.employee_name ||
                                                        `ID: ${schedule.employee_id}`}
                                                </p>
                                                {schedule.employee_code && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {schedule.employee_code}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatScheduleDate(schedule.schedule_date)}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {String(schedule.start_time || "").slice(0, 5)}
                                                {" - "}
                                                {String(schedule.end_time || "").slice(0, 5)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {schedule.shift_name || "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        String(schedule.status).toUpperCase() === "CANCELLED"
                                                            ? "bg-red-100 text-red-700"
                                                            : String(schedule.status).toUpperCase() === "COMPLETED"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {schedule.status || "SCHEDULED"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditSchedule(schedule)}
                                                        className="font-medium text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>

                                                    {String(schedule.status).toUpperCase() !== "CANCELLED" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelSchedule(schedule.id)}
                                                            className="font-medium text-orange-600 hover:underline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                                        className="font-medium text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Employee Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                {/* Filters */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">

                        {/* Search */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, email, phone or employee code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        {/* Department */}
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="All">All Departments</option>
                            <option value="Management">Management</option>
                            <option value="Sales">Sales</option>
                            <option value="Customer Service">Customer Service</option>
                        </select>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Loading employees...
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center">
                            <p className="text-red-500">{error}</p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No employees found.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Employee
                                    </th>
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Employee Code
                                    </th>
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Department
                                    </th>
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Contact
                                    </th>
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Hire Date
                                    </th>
                                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                        Status
                                    </th>
                                    <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                                                    {employee.full_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "?"}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {employee.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: {employee.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="font-medium text-gray-700">
                                                {employee.employee_code || "-"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-700">
                                            {employee.department || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-gray-700">
                                                {employee.email || "-"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {employee.phone || "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-gray-700">
                                            {formatDate(employee.hire_date)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                                    employee.status
                                                )}`}
                                            >
                                                {String(employee.status || "UNKNOWN")
                                                    .toLowerCase()
                                                    .replace(
                                                        /^./,
                                                        (char) => char.toUpperCase()
                                                    )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                className="text-sm font-medium text-gray-700 hover:text-black"
                                                onClick={() =>
                                                    navigate(`/admin/employees/${employee.id}`)
                                                }
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Result Count */}
                {!loading && !error && (
                    <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-900">
                            {filteredEmployees.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-900">
                            {employees.length}
                        </span>{" "}
                        employees
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeManagement;
