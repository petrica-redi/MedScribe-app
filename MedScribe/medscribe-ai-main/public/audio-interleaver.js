// AudioWorkletProcessor that interleaves two input channels into a single
// Int16 PCM buffer and posts it to the main thread for WebSocket streaming.
class InterleaverProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length < 2) return true;

    const ch0 = input[0];
    const ch1 = input[1];
    const length = ch0.length;
    const interleaved = new Int16Array(length * 2);

    for (let i = 0; i < length; i++) {
      interleaved[i * 2] = Math.max(
        -32768,
        Math.min(32767, Math.round(ch0[i] * 32767))
      );
      interleaved[i * 2 + 1] = Math.max(
        -32768,
        Math.min(32767, Math.round(ch1[i] * 32767))
      );
    }

    this.port.postMessage(interleaved.buffer, [interleaved.buffer]);
    return true;
  }
}

registerProcessor("interleaver-processor", InterleaverProcessor);
