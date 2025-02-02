import DataImporter from '../importData'

const dataImporter = new DataImporter()
const allTimeLineTweets = dataImporter.allTimeLineTweets()

const allQuotedStatusIds = []
for (let index = 0; index < allTimeLineTweets.length; index++) {
    const tweet = allTimeLineTweets[index];

    if (tweet.quoted_status_id_str && !tweet.quoted_status) {
        allQuotedStatusIds.push(tweet.quoted_status_id_str)
    }
}


console.log("Deleted tweets:", allQuotedStatusIds.length)
// console.log(deletedTweets)