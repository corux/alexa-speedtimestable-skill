import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { BaseIntentHandler, Intents } from "../utils";

@Intents("AMAZON.NoIntent")
export class NoIntentHandler extends BaseIntentHandler {
  public handle(handlerInput: HandlerInput): Response {
    return handlerInput.responseBuilder
      .speak("Bis zum nächsten mal!")
      .withShouldEndSession(true)
      .getResponse();
  }
}
