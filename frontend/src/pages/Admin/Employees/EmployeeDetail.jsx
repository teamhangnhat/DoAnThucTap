
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById } from "../../../services/admin/employeeService";
import {
    createEmployeeSalary,
    getEmployeeSalaries,
} from "../../../services/admin/salaryService";

const EMPTY_FORM = {
    salary_month: String(new Date().getMonth() + 1),
    salary_year: String(new Date().getFullYear()),
    base_salary: "",
    bonus: "0",
    deduction: "0",
    salary_type: "MONTHLY",
};

const money = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const monthText = (month, year) =>
    month && year
        ? `${String(month).padStart(2, "0")}/${year}`
        : "-";

const getInitials = (name) => {
    if (!name) return "?";

    const words = name.trim().split(/\s+/);

    return words.length === 1
        ? words[0].charAt(0).toUpperCase()
        : (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();
};

const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "ACTIVE") {
        return "bg-emerald-50 text-emerald-700";
    }

    if (value === "INACTIVE") {
        return "bg-slate-100 text-slate-600";
    }

    return "bg-amber-50 text-amber-700";
};

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [salaries, setSalaries] = useState([]);

    const [loading, setLoading] = useState(true);
    const [salaryLoading, setSalaryLoading] = useState(true);

    const [error, setError] = useState("");
    const [salaryError, setSalaryError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showSalaryForm, setShowSalaryForm] = useState(false);
    const [savingSalary, setSavingSalary] = useState(false);
    const [salaryForm, setSalaryForm] = useState(EMPTY_FORM);

    const loadEmployee = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getEmployeeById(id);
            setEmployee(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load employee details."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadSalaries = useCallback(async () => {
        try {
            setSalaryLoading(true);
            setSalaryError("");

            const data = await getEmployeeSalaries(id);

            setSalaries(
                Array.isArray(data)
                    ? data
                    : data?.salaries || data?.data || []
            );
        } catch (err) {
            console.error(err);

            setSalaryError(
                err.response?.data?.message ||
                "Failed to load salary records."
            );

            setSalaries([]);
        } finally {
            setSalaryLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadEmployee();
        loadSalaries();
    }, [loadEmployee, loadSalaries]);

    const sortedSalaries = useMemo(() => {
        return [...salaries].sort((a, b) => {
            return (
                Number(b.salary_year || 0) -
                    Number(a.salary_year || 0) ||
                Number(b.salary_month || 0) -
                    Number(a.salary_month || 0) ||
                Number(b.id || 0) - Number(a.id || 0)
            );
        });
    }, [salaries]);

    const latestSalary = sortedSalaries[0];

    const totalBonus = salaries.reduce(
        (sum, item) => sum + Number(item.bonus || 0),
        0
    );

    const totalDeduction = salaries.reduce(
        (sum, item) => sum + Number(item.deduction || 0),
        0
    );

    const totalNetSalary = salaries.reduce(
        (sum, item) =>
            sum +
            Number(
                item.total_salary ??
                (
                    Number(item.base_salary || 0) +
                    Number(item.bonus || 0) -
                    Number(item.deduction || 0)
                )
            ),
        0
    );

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setSalaryForm((current) => ({
            ...current,
            [name]: value,
        }));

        setFormError("");
    };

    const handleAddSalary = async (event) => {
        event.preventDefault();

        setFormError("");
        setSuccessMessage("");

        const month = Number(salaryForm.salary_month);
        const year = Number(salaryForm.salary_year);
        const baseSalary = Number(salaryForm.base_salary);
        const bonus = Number(salaryForm.bonus || 0);
        const deduction = Number(salaryForm.deduction || 0);

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            setFormError("Please select a valid month.");
            return;
        }

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            setFormError("Year must be between 2000 and 2100.");
            return;
        }

        if (
            !Number.isFinite(baseSalary) ||
            baseSalary < 0 ||
            !Number.isFinite(bonus) ||
            bonus < 0 ||
            !Number.isFinite(deduction) ||
            deduction < 0
        ) {
            setFormError(
                "Salary, bonus and deduction must be zero or greater."
            );
            return;
        }

        if (baseSalary + bonus - deduction < 0) {
            setFormError("Net salary cannot be negative.");
            return;
        }

        try {
            setSavingSalary(true);

            await createEmployeeSalary(id, {
                salary_month: month,
                salary_year: year,
                base_salary: baseSalary,
                bonus,
                deduction,
                salary_type: salaryForm.salary_type,
            });

            await loadSalaries();

            setShowSalaryForm(false);
            setSalaryForm({
                ...EMPTY_FORM,
                salary_month: String(new Date().getMonth() + 1),
                salary_year: String(new Date().getFullYear()),
            });

            setSuccessMessage("Salary record saved successfully.");
        } catch (err) {
            console.error(err);

            setFormError(
                err.response?.data?.message ||
                "Unable to save salary record."
            );
        } finally {
            setSavingSalary(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                    <div className="h-8 w-56 rounded-lg bg-slate-200" />
                    <div className="h-48 rounded-3xl bg-slate-200" />
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-32 rounded-2xl bg-slate-200"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                        !
                    </div>

                    <h2 className="text-xl font-bold text-slate-800">
                        Unable to load employee
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || "Employee information was not found."}
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Go Back
                        </button>

                        <button
                            onClick={loadEmployee}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const employeeData = employee?.employee || employee?.data || employee;

    const fullName =
        employeeData.full_name ||
        employeeData.fullName ||
        employeeData.name ||
        "Unknown Employee";

    const email = employeeData.email || "-";
    const phone = employeeData.phone || "-";
    const address = employeeData.address || "-";
    const employeeCode =
        employeeData.employee_code ||
        employeeData.employeeCode ||
        "-";

    const department = employeeData.department || "-";
    const role = employeeData.role || "EMPLOYEE";
    const status = employeeData.status || "UNKNOWN";
    const hireDate =
        employeeData.hire_date ||
        employeeData.hireDate ||
        employeeData.created_at;

    const netSalary = (salary) =>
        Number(
            salary.total_salary ??
            (
                Number(salary.base_salary || 0) +
                Number(salary.bonus || 0) -
                Number(salary.deduction || 0)
            )
        );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <button
                                onClick={() => navigate(-1)}
                                className="hover:text-indigo-600"
                            >
                                Employees
                            </button>
                            <span>/</span>
                            <span className="font-medium text-slate-800">
                                Employee Details
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Employee Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View employee information and manage payroll.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                        ← Back to Employees
                    </button>
                </div>

                {/* Employee Profile */}
             <section
    id="salary-management"
    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
>
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400" />

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                                    {getInitials(fullName)}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {fullName}
                                        </h2>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(status)}`}
                                        >
                                            {String(status).replaceAll("_", " ")}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {employeeCode} · {department}
                                    </p>

                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Account Role
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {String(role).replaceAll("_", " ")}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs font-medium text-slate-500">
                                        Hire Date
                                    </p>
                                    <p className="mt-2 font-bold text-slate-900">
                                        {formatDate(hireDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                {successMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <span className="font-bold">✓</span>
                        <p>{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Latest Net Salary
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                $
                            </span>
                        </div>

                        <p className="mt-4 text-xl font-bold text-slate-900">
                            {latestSalary ? money(netSalary(latestSalary)) : money(0)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {latestSalary
                                ? monthText(
                                    latestSalary.salary_month,
                                    latestSalary.salary_year
                                )
                                : "No salary records"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Bonuses
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                                +
                            </span>
                        </div>

                        <p className="mt-4 text-xl font-bold text-emerald-700">
                            {money(totalBonus)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Across saved salary records
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Deductions
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl text-rose-600">
                                −
                            </span>
                        </div>

                        <p className="mt-4 text-xl font-bold text-rose-600">
                            {money(totalDeduction)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Across saved salary records
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Net Payroll
                            </p>
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl">
                                ▤
                            </span>
                        </div>

                        <p className="mt-4 text-xl font-bold text-slate-900">
                            {money(totalNetSalary)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Sum of saved salary records
                        </p>
                    </div>
                </section>

                {/* Personal Information */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Personal Information
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Employee contact details
                            </p>
                        </div>

                        <span className="text-2xl">♙</span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Full Name
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {fullName}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Email Address
                            </p>
                            <p className="mt-2 break-all font-semibold text-slate-800">
                                {email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Phone Number
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {phone}
                            </p>
                        </div>

                        <div className="sm:col-span-2 xl:col-span-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Address
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {address}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Employment Information */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">
                            Employment Information
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Employee position and account information
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Employee ID
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {employeeCode}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Department
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {department}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Hire Date
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {formatDate(hireDate)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                System Role
                            </p>
                            <p className="mt-2 font-semibold text-slate-800">
                                {String(role).replaceAll("_", " ")}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Account Status
                            </p>
                            <p className="mt-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(status)}`}
                                >
                                    {String(status).replaceAll("_", " ")}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Salary & Payroll */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                    $
                                </span>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Salary & Payroll
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Manage salary records for this employee.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowSalaryForm((current) => !current);
                                setFormError("");
                                setSuccessMessage("");
                            }}
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            {showSalaryForm ? "Cancel" : "+ Add Salary"}
                        </button>
                    </div>

                    {/* Add Salary Form */}
                    {showSalaryForm && (
                        <form
                            onSubmit={handleAddSalary}
                            className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-8"
                        >
                            <div className="mb-6">
                                <h4 className="text-base font-bold text-slate-900">
                                    Create Salary Record
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter salary details and review the net amount before saving.
                                </p>
                            </div>

                            {formError && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Salary Type */}
                                <div>
                                    <label
                                        htmlFor="salary_type"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Salary Type
                                    </label>

                                    <select
                                        id="salary_type"
                                        name="salary_type"
                                        value={salaryForm.salary_type}
                                        onChange={handleFormChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="MONTHLY">
                                            Monthly Salary
                                        </option>
                                        <option value="13TH_MONTH">
                                            13th Month Salary
                                        </option>
                                    </select>
                                </div>

                                {/* Month */}
                                <div>
                                    <label
                                        htmlFor="salary_month"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Salary Month
                                    </label>

                                    <select
                                        id="salary_month"
                                        name="salary_month"
                                        value={salaryForm.salary_month}
                                        onChange={handleFormChange}
                                        disabled={salaryForm.salary_type === "13TH_MONTH"}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    >
                                        {Array.from({ length: 12 }, (_, index) => (
                                            <option
                                                key={index + 1}
                                                value={String(index + 1)}
                                            >
                                                {new Date(2000, index, 1).toLocaleString(
                                                    "en-US",
                                                    { month: "long" }
                                                )}
                                            </option>
                                        ))}
                                    </select>

                                    {salaryForm.salary_type === "13TH_MONTH" && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            The backend stores this record as December.
                                        </p>
                                    )}
                                </div>

                                {/* Year */}
                                <div>
                                    <label
                                        htmlFor="salary_year"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Salary Year
                                    </label>

                                    <input
                                        id="salary_year"
                                        name="salary_year"
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={salaryForm.salary_year}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                {/* Base Salary */}
                                <div>
                                    <label
                                        htmlFor="base_salary"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Base Salary (VND)
                                    </label>

                                    <input
                                        id="base_salary"
                                        name="base_salary"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={salaryForm.base_salary}
                                        onChange={handleFormChange}
                                        placeholder="e.g. 9000000"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                {/* Bonus */}
                                <div>
                                    <label
                                        htmlFor="bonus"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Bonus (VND)
                                    </label>

                                    <input
                                        id="bonus"
                                        name="bonus"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={salaryForm.bonus}
                                        onChange={handleFormChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                {/* Deduction */}
                                <div>
                                    <label
                                        htmlFor="deduction"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Deduction (VND)
                                    </label>

                                    <input
                                        id="deduction"
                                        name="deduction"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={salaryForm.deduction}
                                        onChange={handleFormChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            {/* Net Salary Preview */}
                            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-700">
                                        Estimated Net Salary
                                    </p>
                                    <p className="mt-1 text-xs text-indigo-600">
                                        Base salary + bonus − deduction
                                    </p>
                                </div>

                                <p className="text-2xl font-bold text-indigo-800">
                                    {money(
                                        Number(salaryForm.base_salary || 0) +
                                        Number(salaryForm.bonus || 0) -
                                        Number(salaryForm.deduction || 0)
                                    )}
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSalaryForm(false);
                                        setFormError("");
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingSalary}
                                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {savingSalary ? "Saving..." : "Save Salary"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Salary History */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900">
                                    Salary History
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    {salaries.length} salary record(s) found
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={loadSalaries}
                                disabled={salaryLoading}
                                className="self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
                            >
                                {salaryLoading ? "Refreshing..." : "↻ Refresh"}
                            </button>
                        </div>

                        {salaryError && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-700">
                                    {salaryError}
                                </p>

                                <button
                                    type="button"
                                    onClick={loadSalaries}
                                    className="mt-2 text-sm font-semibold text-red-700 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {salaryLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-14 animate-pulse rounded-xl bg-slate-100"
                                    />
                                ))}
                            </div>
                        ) : salaries.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                                    $
                                </div>

                                <h5 className="font-bold text-slate-800">
                                    No salary records yet
                                </h5>

                                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                    Salary information will appear here after a record has been added.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setShowSalaryForm(true)}
                                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    + Add First Salary
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">
                                                Period
                                            </th>
                                            <th className="px-5 py-4 font-semibold">
                                                Type
                                            </th>
                                            <th className="px-5 py-4 text-right font-semibold">
                                                Base Salary
                                            </th>
                                            <th className="px-5 py-4 text-right font-semibold">
                                                Bonus
                                            </th>
                                            <th className="px-5 py-4 text-right font-semibold">
                                                Deduction
                                            </th>
                                            <th className="px-5 py-4 text-right font-semibold">
                                                Net Salary
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {sortedSalaries.map((salary, index) => (
                                            <tr
                                                key={
                                                    salary.id ??
                                                    `${salary.salary_year}-${salary.salary_month}-${index}`
                                                }
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                                                    {monthText(
                                                        salary.salary_month,
                                                        salary.salary_year
                                                    )}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                        {salary.salary_type === "13TH_MONTH"
                                                            ? "13th Month"
                                                            : "Monthly"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">
                                                    {money(salary.base_salary)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-emerald-700">
                                                    {money(salary.bonus)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-rose-600">
                                                    {money(salary.deduction)}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">
                                                    {money(netSalary(salary))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {/* Management Modules */}
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">
                            Employee Management
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Other employee management modules
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {/* Salary */}
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                                    $
                                </div>

                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Available
                                </span>
                            </div>

                            <h4 className="mt-4 font-bold text-slate-900">
                                Salary & Payroll
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Manage monthly salaries, bonuses, deductions and salary history.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    document
                                        .getElementById("salary-management")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                }}
                                className="mt-4 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                            >
                                Manage Salary →
                            </button>
                        </div>

                        {/* Work Schedule */}
                        <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                                    ◷
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                    Coming Soon
                                </span>
                            </div>

                            <h4 className="mt-4 font-bold text-slate-900">
                                Work Schedule
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                View employee shifts, working hours and attendance information.
                            </p>
                        </div>

                        {/* Leave Requests */}
                        <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                                    ▣
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                    Coming Soon
                                </span>
                            </div>

                            <h4 className="mt-4 font-bold text-slate-900">
                                Leave Requests
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Review employee leave requests and their approval status.
                            </p>
                        </div>

                        {/* Performance */}
                        <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                                    ↗
                                </div>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                    Coming Soon
                                </span>
                            </div>

                            <h4 className="mt-4 font-bold text-slate-900">
                                Performance
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Track employee performance reviews and evaluation records.
                            </p>
                        </div>

                        {/* Account */}
                        <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                    ♙
                                </div>

                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Available
                                </span>
                            </div>

                            <h4 className="mt-4 font-bold text-slate-900">
                                Account Information
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Review the employee's account role, contact information and status.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>Employee Management System</p>
                    <p>Employee ID: {employeeCode}</p>
                </footer>
            </div>
        </div>
    );
};

export default EmployeeDetail;
