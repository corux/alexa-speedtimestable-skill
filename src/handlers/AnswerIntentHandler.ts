import { HandlerInput } from "ask-sdk-core";
import { IntentRequest, Response } from "ask-sdk-model";
import {
  BaseIntentHandler, getQuestion,
  getSlotValue, Intents, IPersistentAttributes, ISessionAttributes,
} from "../utils";

@Intents("AnswerIntent", "AMAZON.NoIntent", "AMAZON.YesIntent")
export class AnswerIntentHandler extends BaseIntentHandler {
  public canHandle(handlerInput: HandlerInput): boolean {
    const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
    return super.canHandle(handlerInput)
      && attributes.history.filter((item) => item.answerTime == null).length > 0;
  }

  public async handle(handlerInput: HandlerInput): Promise<Response> {
    const attributesManager = handlerInput.attributesManager;
    const attributes = attributesManager.getSessionAttributes() as ISessionAttributes;
    const current = attributes.history.filter((item) => item.answerTime == null)[0];

    const value = getSlotValue(((handlerInput.requestEnvelope.request as IntentRequest).intent.slots || {}).answer);
    let slotValue = parseInt(value, 10);
    if (Number.isNaN(slotValue)) {
      slotValue = undefined;
    }

    const getResponse = async (successText) => {
      const isFinished = attributes.history.filter((item) => item.answerTime == null).length === 0;
      if (isFinished) {
        const totalAnswers = attributes.history.length;
        const correctAnswers = attributes.history.filter((item) => item.answer === item.first * item.second).length;
        let totalDuration = attributes.history
          .map((item) => item.answerTime - item.startTime - item.delayForSpeech)
          .reduce((previous, next) => previous + next, 0);
        // Reduce total duration by 1s per question (Alexa network delay, time to speak answer)
        totalDuration -= totalAnswers * 1 * 1000;

        // Determine previous highscores
        const persistentAttributes = await attributesManager.getPersistentAttributes() as IPersistentAttributes;
        if (!persistentAttributes.scores) {
          persistentAttributes.scores = [];
        }
        const myDurationsPerQuestion = persistentAttributes.scores
          .map((item) => item.totalDuration / item.total / 1000);
        const myBestDuration = myDurationsPerQuestion.length && Math.min(...myDurationsPerQuestion);
        const myAverageDuration = myDurationsPerQuestion.reduce((previous, next) => previous + next, 0)
          / myDurationsPerQuestion.length;

        // Save new data to highscores
        persistentAttributes.scores.push({
          correct: correctAnswers,
          time: new Date().getTime(),
          total: totalAnswers,
          totalDuration,
        });
        handlerInput.attributesManager.savePersistentAttributes();

        const reprompt = "Möchtest du nochmal spielen?";
        let correctAnswersText = `<say-as interpret-as="number">${correctAnswers}</say-as> von ${totalAnswers}`;
        if (correctAnswers === 0) { correctAnswersText = `keine der ${totalAnswers}`; }
        if (correctAnswers === 1) { correctAnswersText = `eine von ${totalAnswers}`; }
        if (correctAnswers === totalAnswers) { correctAnswersText = `alle ${totalAnswers}`; }
        const durationPerQuestion = totalDuration / totalAnswers / 1000;
        let text = `${successText} Du hast ${correctAnswersText} Aufgaben richtig beantwortet.
          Pro Aufgabe hast du weniger als ${this.sayAsSeconds(durationPerQuestion)} benötigt. `;
        if (myDurationsPerQuestion.length > 0 && durationPerQuestion < myBestDuration
          && this.sayAsSeconds(durationPerQuestion) !== this.sayAsSeconds(myBestDuration)) {
          const speechcon = this.getRandomEntry(["wow", "donnerwetter", "super"]);
          text += `<say-as interpret-as="interjection">${speechcon}</say-as>, das ist deine neue Bestzeit! `;
        } else if (myDurationsPerQuestion.length > 1 && durationPerQuestion > myAverageDuration) {
          const speechcon = this.getRandomEntry([
            "oh mann", "naja", "ich glaub mich laust der affe",
            "ich glaub mein schwein pfeift", "ach du liebe zeit",
            "ach du meine güte", "ach du grüne neune",
          ]);
          text += `<say-as interpret-as="interjection">${speechcon}</say-as>, das kannst du aber besser!
            Deine Bestzeit liegt bei ${this.sayAsSeconds(myBestDuration)}. `;
        }
        text += reprompt;
        return handlerInput.responseBuilder
          .speak(text)
          .reprompt(reprompt)
          .getResponse();
      }

      return getQuestion(handlerInput, successText);
    };

    current.answer = slotValue;
    current.answerTime = new Date().getTime();

    const correctAnswer = current.first * current.second;
    const answer = correctAnswer === 49 ? "feiner Sand"
      : `<say-as interpret-as="number">${correctAnswer}</say-as>.`;
    if (slotValue == null) {
      return getResponse(`Die Lösung war ${answer}.`);
    } else if (current.answer === correctAnswer) {
      const speechcon = this.getRandomEntry([
        "richtig", "bingo", "bravo",
        "prima", "stimmt", "super",
        "yay", "jawohl",
      ]);
      return getResponse(`<say-as interpret-as='interjection'>${speechcon}</say-as>.`);
    } else {
      const speechcon = this.getRandomEntry([
        "von wegen", "verflixt", "schade",
        "pustekuchen", "oje", "oh oh",
        "oh nein", "naja", "mamma mia",
        "nichts da",
      ]);
      const responsesAnswer = this.getRandomEntry([
        `richtig war ${answer}`,
        `korrekt war ${answer}`,
        `das war ${answer}`,
        `die Antwort war ${answer}`,
      ]);
      return getResponse(`<say-as interpret-as='interjection'>${speechcon}</say-as>, ${responsesAnswer}.`);
    }
  }

  private sayAsSeconds(seconds: number): string {
    return `<say-as interpret-as="unit">${seconds.toFixed(1).replace(".", ",")}s</say-as>`;
  }

  private getRandomEntry(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
}
