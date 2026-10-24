
import axios from "axios";

const API_URL = "http://localhost:5000/api/work-schedules";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Lấy danh sách lịch làm việc theo quyền của tài khoản.
export const getWorkSchedules = async (params = {}) => {
    const response = await axios.get(API_URL, {
        ...getAuthConfig(),
        params,
    });

    return response.data;
};

// Xem chi tiết một lịch làm việc.
export const getWorkScheduleById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Thêm lịch làm việc.
export const createWorkSchedule = async (scheduleData) => {
    const response = await axios.post(
        API_URL,
        scheduleData,
        getAuthConfig()
    );

    return response.data;
};

// Cập nhật lịch làm việc.
export const updateWorkSchedule = async (id, scheduleData) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        scheduleData,
        getAuthConfig()
    );

    return response.data;
};

// Hủy lịch làm việc.
export const cancelWorkSchedule = async (id) => {
    const response = await axios.patch(
        `${API_URL}/${id}/cancel`,
        {},
        getAuthConfig()
    );

    return response.data;
};

// Xóa lịch làm việc.
export const deleteWorkSchedule = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};
