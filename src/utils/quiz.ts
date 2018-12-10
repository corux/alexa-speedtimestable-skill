import { HandlerInput } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { ISessionAttributes } from "./attributes";

export function getNumberOfQuestions(): number {
  return 8;
}

/** Returns a random number between 1 and 10 */
function getRandomNumber(): number {
  return Math.floor(Math.random() * 10) + 1;
}

function createQuestions() {
  const questions: Array<{ first: number, second: number }> = [];
  const limitNumbersToOnce = [1, 2, 10];
  while (questions.length < getNumberOfQuestions()) {
    const first = getRandomNumber();
    const second = getRandomNumber();
    const sameNumbersNotYetUsed = questions
      .filter((item) => Math.min(item.first, item.second) === Math.min(first, second)
        && Math.max(item.first, item.second) === Math.max(first, second))
      .length === 0;
    const limitedNumbersNotYetUsed = [].concat(...questions.map((item) => [item.first, item.second]))
      .filter((item) => item === first || item === second)
      .filter((item) => limitNumbersToOnce.indexOf(item) !== -1)
      .length === 0;
    if (sameNumbersNotYetUsed && limitedNumbersNotYetUsed) {
      questions.push({
        first,
        second,
      });
    }
  }

  return questions;
}

function convertNumberToText(num: number) {
  const mapping = {
    1: "ein",
    2: "zwei",
    3: "drei",
    4: "vier",
    5: "fünf",
    6: "sechs",
    7: "sieben",
    8: "acht",
    9: "neun",
    10: "zehn",
    11: "elf",
    12: "zwölf",
    100: "hundert",
  };

  if (mapping[num] != null) {
    return mapping[num];
  }

  const second = num % 10;
  const first = (num - second) / 10;
  if (first > 1) {
    return `${mapping[second]} und ${mapping[first]}`;
  }

  return `${mapping[second]} ${mapping[first]}`;
}

function estimateSpeechOutputDuration(text: string): number {
  const secondsPerWord = 0.45;
  const transformed = text
    .replace(/<[^>]*>/g, "")
    .replace(/[\.\,\?]/g, "")
    .replace(/([0-9]+)/g, (match, capture) => match.replace(capture, convertNumberToText(capture)));
  const words = transformed.split(" ")
    .filter((item) => !!item.trim())
    .length;
  return words * secondsPerWord * 1000;
}

export function getQuestion(handlerInput: HandlerInput, textPrefix?: string): Response {
  const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;
  const current = attributes.history.filter((item) => item.answerTime == null)[0];

  const reprompt = `Wieviel ist
    <say-as interpret-as="number">${current.first}</say-as> mal
    <say-as interpret-as="number">${current.second}</say-as>?`;
  let text = `${textPrefix || ""} `;
  text += reprompt;

  current.delayForSpeech = estimateSpeechOutputDuration(text);
  current.startTime = new Date().getTime();

  const response = handlerInput.responseBuilder
    .speak(text)
    .reprompt(reprompt);

  return response.getResponse();
}

export function startQuiz(handlerInput: HandlerInput, text?: string): Response {
  const attributes = handlerInput.attributesManager.getSessionAttributes() as ISessionAttributes;

  attributes.history = createQuestions();

  return getQuestion(handlerInput, text);
}
