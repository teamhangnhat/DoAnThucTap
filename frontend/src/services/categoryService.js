import axios from "axios";

const API_URL = "http://localhost:5000/api/categories";

export const getCategories = () => {

    return axios.get(API_URL);

};