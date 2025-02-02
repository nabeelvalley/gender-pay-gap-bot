import { HandleIncomingTweetInput, IncomingTweetListenerQueuer, relevantWords } from "./IncomingTweetListenerQueuer"
import { Logger } from "tslog"

const twitterData = [{ twitter_id_str: "1" }, { twitter_id_str: "2" }]

describe("IncomingTweetListenerQueuer", () => {
    const mockTwitterClient = {
        startStreamingTweets: jest.fn(),
    };
    const mockSqsClient = {
        queueMessage: jest.fn()
    }
    const mockDataImporter = {
        twitterUserDataProd: jest.fn().mockReturnValue(twitterData)
    }
    const mockRepository = {
        getGpgForTwitterId: jest.fn().mockReturnValue({ companyData: {} })
    }
    const handler = new IncomingTweetListenerQueuer(mockTwitterClient, mockSqsClient, mockDataImporter, mockRepository, new Logger())
    describe("listen", () => {
        it("should listen to twitter with a handler", async () => {
            await handler.listen()
            expect(mockTwitterClient.startStreamingTweets).toBeCalledTimes(1)
            expect(mockTwitterClient.startStreamingTweets.mock.calls[0][0]).toEqual(["1", "2"])
        })
    })
    describe("getFollowsFromData", () => {
        it("should get the followers into a list", async () => {
            const followers = handler.getFollowsFromData(twitterData as any)
            expect(followers).toEqual(["1", "2"])
        })
    })
    describe("checkTweetContainsWord", () => {
        it("checks that a special word is in the tweet", () => {
            const result = handler.checkTweetContainsWord("some text...  ")
            expect(result).toBe(false)
        })
        it("checks that a special word is in the tweet", () => {
            const result = handler.checkTweetContainsWord("some text... WOMEN’S DAY ")
            expect(result).toBe(true)
        })
        it("should ignore apostrophes", () => {
            let result = handler.checkTweetContainsWord("some text ' '’ '’... women’s history month            ")
            expect(result).toBe(true)
            result = handler.checkTweetContainsWord("some text ' '’ '’... women's history month            ")
            expect(result).toBe(true)
            result = handler.checkTweetContainsWord("some text ' '’ '’... womens history month            ")
            expect(result).toBe(true)
        })
    })
    describe("handleIncomingTweet", () => {
        it("should take an incoming tweet and queue it", async () => {
            const input: HandleIncomingTweetInput = {
                twitterUserId: "twitterUserId",
                tweetId: "tweetId",
                user: "user",
                screenName: "screenName",
                isRetweet: false,
                text: "text",
                timeStamp: "timeStamp",
                fullTweetObject: { text: relevantWords[0] }
            }
            await handler.handleIncomingTweet(input)
            expect(mockSqsClient.queueMessage).toBeCalledWith(input)
        })
    })
})