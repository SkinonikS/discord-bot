export default class SimpleEvent {
  public constructor(public readonly eventName: string, public readonly data: object) { }

  public static tryParse(obj: unknown): SimpleEvent {
    if (typeof obj !== 'object' || obj === null || ! ('eventName' in obj) || ! ('data' in obj)) {
      throw new TypeError('Expected an object with eventName and data properties');
    }

    if (typeof obj.eventName !== 'string' || typeof obj.data !== 'object') {
      throw new TypeError('Invalid object format for SimpleEvent');
    }

    return new SimpleEvent(obj.eventName, obj.data as object);
  }
}
