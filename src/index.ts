import { SkillBuilders } from "ask-sdk-core";
import { DynamoDbPersistenceAdapter } from "ask-sdk-dynamodb-persistence-adapter";
import {
    AmazonHelpIntentHandler,
    AmazonStopIntentHandler,
    AnswerIntentHandler,
    CustomErrorHandler,
    LaunchRequestHandler,
    NoIntentHandler,
    SessionEndedHandler,
    YesIntentHandler,
} from "./handlers";
import { LogInterceptor } from "./interceptors";

const dynamodbAdapter = new DynamoDbPersistenceAdapter({
    createTable: true,
    tableName: "alexa-speedtimestable-skill",
});

export const handler = SkillBuilders.custom()
    .addRequestHandlers(
        new LaunchRequestHandler(),
        new AmazonStopIntentHandler(),
        new AmazonHelpIntentHandler(),
        new SessionEndedHandler(),
        new AnswerIntentHandler(),
        new NoIntentHandler(),
        new YesIntentHandler(),
    )
    .addErrorHandlers(
        new CustomErrorHandler(),
    )
    .addRequestInterceptors(
        new LogInterceptor(),
    )
    .addResponseInterceptors(
        new LogInterceptor(),
    )
    .withPersistenceAdapter(dynamodbAdapter)
    .lambda();
