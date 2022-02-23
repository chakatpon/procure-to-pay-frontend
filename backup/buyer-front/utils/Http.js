
import axios from 'axios'
import join from 'url-join'
import { service } from '../constant/index'

const isAbsoluteURLRegex = /^(?:\w+:)\/\//

axios.interceptors.request.use(async (config) => {
    if (!isAbsoluteURLRegex.test(config.url)) {
        config.url = join(service, config.url)  //  *****  service ที่ import มา  *****
    }
    config.timeout = 10000 // 10 Second
    return config
})

export const http = axios
