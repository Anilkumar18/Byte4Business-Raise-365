import { CONSTANTS } from "./Constants"
import axios from "axios"

export const userService = {
    login,
    register,
    forgotPassword,
    logout,
    updateProfile,
    updateAvatar,
    updateDeviceToken,
    updatePassword,
    exitFundraiser
};

const ENDPOINTS = {

    LOGIN: "users/login.json",
    REGISTER: "users/register_v1.json",
    FORGOT_PASSWORD: "users/forgot.json",
    LOGOUT: "users/logout.json",
    UPDATE_PROFILE: "users/settings.json",
    UPDATE_AVATAR: "users/avatar.json",
    UPDATE_SETTINGS: 'users/settings.json',
    EXIT_FUNDRAISER: 'users/settings.json',
}



async function register(payload) {
    const URL = CONSTANTS.BASE_URL + ENDPOINTS.REGISTER;
    return axios.post(URL, payload);
}



async function updateProfile(payload) {
    const URL = CONSTANTS.BASE_URL + ENDPOINTS.UPDATE_PROFILE;
    return axios.post(URL, payload);
}

async function updateAvatar(payload) {
    const URL = CONSTANTS.BASE_URL + ENDPOINTS.UPDATE_AVATAR;
    return axios.post(URL, payload, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}



async function login(creds) {
    let URL = CONSTANTS.BASE_URL + ENDPOINTS.LOGIN;
    console.log("point", creds)

    return axios.post(URL, creds)
}



async function logout(payload) {
    const URL = CONSTANTS.BASE_URL + ENDPOINTS.LOGOUT;
    return axios.post(URL, payload);
}


async function forgotPassword(data) {
    let URL = CONSTANTS.BASE_URL + ENDPOINTS.FORGOT_PASSWORD;
    return axios.post(URL, data)
}

async function updateDeviceToken(payload) {

    const URL = `${CONSTANTS.BASE_URL}${ENDPOINTS.UPDATE_SETTINGS}`

    console.log('updateDeviceToken payload', URL, payload);
    return axios.post(URL, payload)
}


async function updatePassword(payload) {

    const URL = `${CONSTANTS.BASE_URL}${ENDPOINTS.UPDATE_SETTINGS}`

    console.log('updatePassword payload', URL, payload);
    return axios.post(URL, payload)
}

async function exitFundraiser(payload) {
    const URL = CONSTANTS.BASE_URL + ENDPOINTS.EXIT_FUNDRAISER;
    return axios.post(URL, payload);
}
