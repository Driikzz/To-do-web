import axios from "axios"

const BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:4000/api'

const UserServices = {
    async login(email: string, password: string) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, { email, password })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data.message)
        }
    },
    async register(firstname: string, lastname: string, email: string, password: string) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, { firstname, lastname, email, password })
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data.message)
        }
    }
}

export default UserServices