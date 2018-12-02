import { HandlerInput } from "ask-sdk-core";
import { Slot } from "ask-sdk-model";

export function getLocale(handlerInput: HandlerInput): string {
  return (handlerInput.requestEnvelope.request as { locale: string }).locale as string;
}

export function getSlotValue(slot: Slot, returnDefaultValue: boolean = true): string {
  if (!slot || !slot.value) {
    return null;
  }
  try {
    if (slot.resolutions.resolutionsPerAuthority[0].status.code !== "ER_SUCCESS_MATCH") {
      return returnDefaultValue ? slot.value : null;
    }

    return slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
  } catch (e) {
    return returnDefaultValue ? slot.value : null;
  }
}
