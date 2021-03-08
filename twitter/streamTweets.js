import Twit from "twit"
import dotEnv from "dotenv"
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
import { getMostRecentGPG } from "../utils.js"
import { writeJsonFile } from "../utils/write.js";

dotEnv.config()

const require = createRequire(import.meta.url); // construct the require method
let companyDataProd = require("../data/twitterAccountData/twitterUserData-prod.json")
const companyDataTest = require("../data/twitterAccountData/twitterUserData-test.json")
const successfulTweets = require("../data/tweets/successful-tweets.json")
const unsuccessfulTweets = require("../data/tweets/unsuccessful-tweets.json")

const isTest = process.argv[2] === "test" || process.argv[3] === "test"
const companyData = isTest ? companyDataTest : companyDataProd;
if (isTest) {
    console.log("Starting in TEST mode...")
    console.log("Watching for companies:", companyData)
} else {
    console.log("Starting in PROD mode...")
}

var T = new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Get follows from data
const follows = getFollowsFromData(companyData)
debugPrint(follows)

var stream = T.stream('statuses/filter', { follow: follows });

stream.on('tweet', async (tweet) => {
    const twitterUserId = tweet.user.id_str
    try {
        console.log("Stream received")

        const isRetweet = tweet.text.startsWith("RT")
        if (isRetweet) {
            console.log("Ignoring retweet")
            return
        }

        let time = new Date().toISOString()
        console.log(`Tweet detected: ${time} @${tweet.user.screen_name} - ${tweet.text}`);
        debugPrint(tweet)
        // Check tweet contains words
        const isRelevantTweet = checkTweetContainsWord(tweet.text)
        if (!isRelevantTweet) {
            console.log("Irrelevant tweet")
            return
        }

        // Check we haven't already posted
        debugPrint(tweet.user)
        const newPost = checkHaveNotPosted(twitterUserId, successfulTweets)
        if (!newPost) {
            console.log("Duplicate tweet")
            return
        }

        // Get the company from data by twitter Id
        const company = getCompanyDataByTwitterId(twitterUserId, companyData)
        if (!company) {
            const errMessage = `"Could not find company data for: ${twitterUserId}`
            console.log(errMessage)
            unsuccessfulTweets.push({ twitter_id: twitterUserId, twitter_screen_name: tweet.user.screen_name, error: errMessage, time })
            return writeUnsuccessfulTweets()
        }

        // get words for post
        const tweetStatus = getCopy(company)

        await quoteTweet(T, tweetStatus, tweet)
        console.log("Successful tweet @", tweet.user.name)
        // Save that we have posted successfully
        successfulTweets.push({ twitter_id: twitterUserId, twitter_screen_name: tweet.user.screen_name, time })
        await writeSuccessfulTweets()
        console.log("Successful tweets total: ", successfulTweets.length)
    } catch (err) {
        console.log(err)
        console.log("Error while tweeting @", tweet.user.name)
        // Record errors
        unsuccessfulTweets.push({ twitter_id: twitterUserId, twitter_screen_name: tweet.user.screen_name, error: `Error while tweeting: ${err.message}`, time })
        await writeUnsuccessfulTweets()
    }
});

function quoteTweet(T, status, tweet) {
    return new Promise((resolve, reject) => {
        T.post('statuses/update', { status, attachment_url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, auto_populate_reply_metadata: true }, (err) => {
            if (err) { return reject(err) }
            return resolve({ status: 'Tweet sent' })
        })
    })
}

function postTweet(T, tweet) {
    return new Promise((resolve, reject) => {
        T.post('statuses/update', { status: tweet }, (err) => {
            if (err) { return reject(err) }
            return resolve({ status: 'Tweet sent' })
        })
    })
}

function reTweet(T, tweetId, tweet, quoted_status) {
    return new Promise((resolve, reject) => {
        T.post('statuses/retweet/' + tweetId, { status: tweet, quoted_status }, (err) => {
            if (err) { return reject(err) }
            return resolve({ status: 'Tweet sent' })
        })
    })
}


const words = [
    "IWD2021",
    "#IWD2021",
    "INTERNATIONALWOMENSDAY",
    "#INTERNATIONALWOMENSDAY",
    "#CHOOSETOCHALLENGE",
    "INTERNATIONAL WOMENS DAY",
    "INTERNATIONAL WOMEN'S DAY",
    "INTERNATIONAL WOMEN’S DAY",
    "WOMENS DAY",
    "WOMENSDAY",
    "WOMEN'S DAY",
    "WOMEN’S DAY"
]

function checkTweetContainsWord(tweet) {
    const upperCaseTweet = tweet.toUpperCase()
    for (let index = 0; index < words.length; index++) {
        const word = words[index];
        if (upperCaseTweet.includes(word)) {
            return true
        }
    }
    return false
}

function checkHaveNotPosted(twitterId, successfulTweets) {
    for (let index = 0; index < successfulTweets.length; index++) {
        const t = successfulTweets[index];
        if (t.twitter_id == twitterId) {
            return false
        }
    }
    return true
}

async function writeSuccessfulTweets() {
    const filePath = "./data/tweets/successful-tweets.json"
    await writeJsonFile(filePath, successfulTweets)
}

async function writeUnsuccessfulTweets() {
    const filePath = "./data/tweets/unsuccessful-tweets.json"
    await writeJsonFile(filePath, unsuccessfulTweets)
}

function getCompanyDataByTwitterId(twitterId, companies) {
    for (let index = 0; index < companies.length; index++) {
        const c = companies[index];
        if (c.twitter_id_str == twitterId) {
            return c
        }
    }
    return null
}

function getCopy(companyData) {
    const mostRecentGPG = getMostRecentGPG(companyData)
    let mostRecent = 0
    if (typeof mostRecentGPG == "string") {
        mostRecent = parseFloat(mostRecentGPG)
    } else {
        mostRecent = mostRecentGPG
    }
    const isPositiveGpg = mostRecent > 0.0
    if (isPositiveGpg) {
        return `In this organisation, women's mean hourly pay is ${mostRecent}% lower than men's`
    } else {
        return `In this organisation, women's mean hourly pay is ${-1 * mostRecent}% higher than men's`
    }
}

function getFollowsFromData(companies) {
    const twitterIds = []
    for (let index = 0; index < companies.length; index++) {
        const c = companies[index]
        twitterIds.push(c.twitter_id_str)
    }
    return twitterIds
}


function debugPrint(msg) {
    if (isTest) {
        console.log(msg)
    }
}