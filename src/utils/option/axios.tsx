import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://testapi.antimatter.finance/app/',
  timeout: 5000,
  headers: { 'content-type': 'application/json', accept: 'application/json' }
})

export const Axios = {
  get(url: string, params: { [key: string]: any }) {
    return axiosInstance.get(url, { params })
  },
  post(url: string, data: { [key: string]: any }, params = {}) {
    return axiosInstance.post(url, data, { params })
  }
}
