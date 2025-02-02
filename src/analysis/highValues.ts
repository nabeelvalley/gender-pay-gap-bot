import { getMostRecentGPG } from "../utils/getMostRecentGPG"
import { getAllCompanyDataByTwitterScreenName } from "../twitter/getCompanyDataByTwitterId";
import { writeJsonFile } from "../utils/write";
import Data from "../importData/index"

const dataImporter = new Data()

const data = dataImporter.companiesGpgData()
const donkedData = dataImporter.successfulTweets()
const companyDataWithTwitter = dataImporter.twitterUserDataProd()

async function run() {
    const highValueNotTweeted = []
    for (let index = 0; index < data.length; index++) {
        const company = data[index];
        let gpg = getMostRecentGPG(company)
        if (!gpg || gpg < 50) {
            continue;
        }

        const hasBeenDonked = getDonkedByCompanyName(company.companyName, donkedData, companyDataWithTwitter)
        if (hasBeenDonked) {
            continue
        }

        highValueNotTweeted.push(company)
    }

    const filePath = "./data/high-value-not-tweeted.json"
    await writeJsonFile(filePath, highValueNotTweeted)

    function getDonkedByCompanyName(companyName, donkedData, companyDataWithTwitter) {
        for (let index = 0; index < donkedData.length; index++) {
            const d = donkedData[index];
            const companiesByTwitterName = getAllCompanyDataByTwitterScreenName(d.twitter_screen_name, companyDataWithTwitter)
            if (!companiesByTwitterName || !companiesByTwitterName.length) {
                continue
            }

            for (let index = 0; index < companiesByTwitterName.length; index++) {
                const companyByTwitterName = companiesByTwitterName[index];
                if (companyName.toLowerCase() == companyByTwitterName.companyName?.toLowerCase()) {
                    console.log("Skipping Company:", companyName, "Twitter name", companyByTwitterName?.companyName)
                    return d
                }
            }

        }
        return null
    }
}

run()