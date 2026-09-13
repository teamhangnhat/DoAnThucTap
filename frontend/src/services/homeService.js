import axios from "axios";

const API_URL =
    "http://localhost:5000/api/home";


// ================= HERO =================

export const getHeroStatistics = async () => {

    const response =
        await axios.get(
            `${API_URL}/hero`
        );

    return response.data;

};


// ================= WEBSITE SETTINGS =================

export const getWebsiteSettings = async () => {

    const response =
        await axios.get(
            `${API_URL}/settings`
        );

    return response.data;

};


// ================= FLASH SALE =================

export const getActiveFlashSale = async () => {

    const response =
        await axios.get(
            `${API_URL}/flash-sale`
        );

    return response.data;

};