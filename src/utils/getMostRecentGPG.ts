import { CompanyDataItem } from "../importData"

export function getMostRecentGPG(data: CompanyDataItem) {
    if (data.gpg_2021_2022) {
        return data.gpg_2021_2022
    }
    if (data.gpg_2020_2021) {
        return data.gpg_2020_2021
    }
    if (data.gpg_2019_2020) {
        return data.gpg_2019_2020
    }
    if (data.gpg_2018_2019) {
        return data.gpg_2018_2019
    }
    if (data.gpg_2017_2018) {
        return data.gpg_2017_2018
    }
    return null
}

export function isNumber(n: any): boolean {
    if (n === null || n === undefined || n === "") {
        return false
    }
    if (typeof n === "string") {
        let parsedStringNumber = parseFloat(n)
        return isNumber(parsedStringNumber)
    }
    return true
}

export function getMostRecentMedianGPG(data: CompanyDataItem) {
    if (isNumber(data.medianGpg_2021_2022)) {
        return data.medianGpg_2021_2022
    }
    if (isNumber(data.medianGpg_2020_2021)) {
        return data.medianGpg_2020_2021
    }
    if (isNumber(data.medianGpg_2019_2020)) {
        return data.medianGpg_2019_2020
    }
    if (isNumber(data.medianGpg_2018_2019)) {
        return data.medianGpg_2018_2019
    }
    if (isNumber(data.medianGpg_2017_2018)) {
        return data.medianGpg_2017_2018
    }
    return null
}