import dotEnv from "dotenv"
import { SqsClient } from "../sqs/Client"
import { Logger } from "tslog"
import { TwitterClient } from "../twitter/Client"
import { IncomingTweetListenerQueuer } from "./IncomingTweetListenerQueuer"
import DataImporter from "../importData"

dotEnv.config()

const twitterClient = new TwitterClient()
const sqsClient = new SqsClient()
const dataImporter = new DataImporter()
const logger = new Logger()

const handler = new IncomingTweetListenerQueuer(twitterClient, sqsClient, dataImporter, logger)

handler.listen()
// TODO local config / handler here
// TODO Infra
// SET .ENV after making infra