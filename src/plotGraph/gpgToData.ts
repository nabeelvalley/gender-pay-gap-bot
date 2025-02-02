import { CompanyDataItem } from "../importData";
import { GraphData } from "./plot";

export function gpgToData(companyData: CompanyDataItem): GraphData {
    return {
        medianData: [
            { x: 2017, y: companyData.medianGpg_2017_2018 },
            { x: 2018, y: companyData.medianGpg_2018_2019 },
            { x: 2019, y: companyData.medianGpg_2019_2020 },
            { x: 2020, y: companyData.medianGpg_2020_2021 },
            { x: 2021, y: companyData.medianGpg_2021_2022 }
        ].filter((item) => item.y !== null),
        meanData: [
            { x: 2017, y: companyData.gpg_2017_2018 },
            { x: 2018, y: companyData.gpg_2018_2019 },
            { x: 2019, y: companyData.gpg_2019_2020 },
            { x: 2020, y: companyData.gpg_2020_2021 },
            { x: 2021, y: companyData.gpg_2021_2022 }
        ].filter((item) => item.y !== null)
    }
}