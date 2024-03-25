export default class LPF {
  // must be smaller than 1
  private smoothing: number;
  private buffer: number[];
  private bufferMaxSize: number;

  constructor(smoothing?: number) {
    if (smoothing && smoothing > 1) {
      throw new Error("Cannot initiate LPF with smoothing larger than 1.");
    }
    this.smoothing = smoothing || 0.5;
    this.buffer = [];
    this.bufferMaxSize = 10;
  }

  public init(values: number[]) {
    for (var i = 0; i < values.length; i++) {
      this.__push(values[i]);
    }
    return this.buffer;
  }

  private __push(value: number): number {
    var removed = this.buffer.length === this.bufferMaxSize ? this.buffer.shift() : 0;
    this.buffer.push(value);
    return removed || 0;
  }

  /**
   * Smooth value from stream
   * @param nextValue
   */
  public next(nextValue: number) {
    var self = this;
    var removed = this.__push(nextValue);
    var result = this.buffer.reduce((last, current) => self.smoothing * current + (1 - self.smoothing) * last, removed);
    this.buffer[this.buffer.length - 1] = result;
    return result;
  }

  /**
   * Smooth array of values
   * @param values
   */
  public smoothArray(values: number[]) {
    var value = values[0];
    for (var i = 1; i < values.length; i++) {
      var current = values[i];
      value += (current - value) * this.smoothing;
      values[i] = Math.round(value);
    }
    return values;
  }
}
