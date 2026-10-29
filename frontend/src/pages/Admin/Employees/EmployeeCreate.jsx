
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { createEmployee } from "../../../services/admin/employeeService";

const EmployeeCreate = () => {
    const navigate = useNavigate();

   const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    hire_date: "",
    department: ""
});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

       if (
    !form.full_name.trim() ||
    !form.email.trim() ||
    !form.password ||
    !form.phone.trim() ||
    !form.address.trim()
) {
    setError("Please fill in all required fields.");
    return;
}

        setLoading(true);

        try {
          await createEmployee({
    ...form,
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim()
});

            setSuccess("Employee created successfully.");

            setTimeout(() => {
                navigate("/admin/employees");
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create employee."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black";

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate("/admin/employees")}
                    className="mb-5 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
                >
                    <ArrowLeft size={18} />
                    Back to Employee Management
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Add New Employee
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create an employee account and profile.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <section>
                        <h2 className="mb-4 font-semibold text-gray-900">
                            Account Information
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Full Name *
                                </label>
                                <input
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    maxLength={255}
                                    required
                                    className={inputClass}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    maxLength={255}
                                    required
                                    className={inputClass}
                                    placeholder="employee@example.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Initial Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={5}
                                    required
                                    className={inputClass}
                                    placeholder="At least 5 characters, uppercase and number"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    maxLength={20}
                                    required
                                    className={inputClass}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium">
                                    Address
                                </label>
                                <input
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    maxLength={500}
                                    className={inputClass}
                                    placeholder="Enter address (optional)"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 font-semibold text-gray-900">
                            Employee Information
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
    <label className="mb-1 block text-sm font-medium">
        Employee Code
    </label>
    <input
        type="text"
        value="Automatically generated"
        disabled
        className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`}
    />
    <p className="mt-1 text-xs text-gray-500">
        The system will automatically generate the employee code.
    </p>
</div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Department
                                </label>
                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className={inputClass}
                                >
                                    <option value="">Select department</option>
                                    <option value="Management">Management</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Customer Service">Customer Service</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Hire Date
                                </label>
                                <input
                                    type="date"
                                    name="hire_date"
                                    value={form.hire_date}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/employees")}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            <UserPlus size={18} />
                            {loading ? "Creating..." : "Create Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeCreate;
