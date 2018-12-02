export interface ISessionAttributes {
  history: Array<{
    first: number,
    second: number,
    answer?: number,
    startTime?: number,
    delayForSpeech?: number,
    answerTime?: number;
  }>;
}

export interface IPersistentAttributes {
  scores: Array<{
    correct: number,
    time: number,
    total: number,
    totalDuration: number,
  }>;
}
