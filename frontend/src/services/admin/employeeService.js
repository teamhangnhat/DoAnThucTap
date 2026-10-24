import axios from "axios";

const API_URL = "http://localhost:5000";

export const getEmployees = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/api/employees`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


export const getEmployeeById = async (id) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/api/employees/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getScheduleEmployees = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/api/employees/schedule-employees`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};
