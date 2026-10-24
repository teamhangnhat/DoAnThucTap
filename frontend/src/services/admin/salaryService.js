
import axios from "axios";

const API_URL = "http://localhost:5000";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Get salary records of an employee
export const getEmployeeSalaries = async (employeeId) => {
    const response = await axios.get(
        `${API_URL}/api/salaries/${employeeId}`,
        getAuthConfig()
    );

    return response.data;
};

// Create a salary record
export const createEmployeeSalary = async (
    employeeId,
    salaryData
) => {
    const response = await axios.post(
        `${API_URL}/api/salaries/${employeeId}`,
        salaryData,
        getAuthConfig()
    );

    return response.data;
};
