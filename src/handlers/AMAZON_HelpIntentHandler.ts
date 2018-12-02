import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getNumberOfQuestions,
  getQuestion,
  Intents,
  ISessionAttributes,
} from "../utils";

@Intents("AMAZON.HelpIntent")
export class AmazonHelpIntentHandler extends BaseIntentHandler {
  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    const isInProgress = attributes.history.filter((item) => item.answerTime == null).length > 0;
    const reprompt = `Bist du bereit für die nächste Runde?`;
    const helpText = `Ich stelle dir ${getNumberOfQuestions()} Rechenaufgaben und du musst sie richtig beantworten.
      Versuche die Antworten so schnell wie möglich zu sagen.`;

    if (isInProgress) {
      return getQuestion(handlerInput, helpText);
    }

    return handlerInput.responseBuilder
      .speak(`${helpText} ${reprompt}`)
      .reprompt(reprompt)
      .getResponse();
  }
}
