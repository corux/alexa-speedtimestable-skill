import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import {
  BaseIntentHandler,
  getNumberOfQuestions,
  IPersistentAttributes,
  Request,
  startQuiz,
} from "../utils";

@Request("LaunchRequest")
export class LaunchRequestHandler extends BaseIntentHandler {
  public canHandle(handlerInput: HandlerInput): boolean {
    const session = handlerInput.requestEnvelope.session;
    return super.canHandle(handlerInput) || (session && session.new);
  }

  public async handle(handlerInput: HandlerInput): Promise<Response> {
    let text;
    const attributes = await handlerInput.attributesManager.getPersistentAttributes() as IPersistentAttributes;
    const lastAccess = Math.max(...(attributes.scores || []).map((item) => item.time)) || 0;
    const accessedRecently = lastAccess > (new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    if (!accessedRecently) {
      text = `<say-as interpret-as='interjection'>Willkommen</say-as> beim schnellen Einmaleins!
        Ich stelle dir ${getNumberOfQuestions()} Rechenaufgaben und du musst sie richtig beantworten.
        Versuche die Antworten so schnell wie möglich zu sagen. `;
    } else {
      text = "<say-as interpret-as='interjection'>Willkommen</say-as> zurück beim schnellen Einmaleins! ";
    }

    text += "Hier ist die erste Aufgabe.";

    return startQuiz(handlerInput, text);
  }
}
