/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Analyser class for live audio visualisation.
 */
export class Analyser {
  private analyser: AnalyserNode;
  private bufferLength = 0;
  private dataArray: Uint8Array;
  private updateCount = 0;
  private lastLogTime = 0;
  private creationTime: number;

  constructor(node: AudioNode) {
    this.creationTime = Date.now();
    console.log("🔬 ANALYSER: Creating new Analyser instance");
    console.log("🔬 Input node details:", {
      context: node.context.constructor.name,
      numberOfInputs: node.numberOfInputs,
      numberOfOutputs: node.numberOfOutputs,
      contextState: node.context.state,
      sampleRate: node.context.sampleRate
    });

    this.analyser = node.context.createAnalyser();
    this.analyser.fftSize = 32;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    console.log("🔬 AnalyserNode configured:", {
      fftSize: this.analyser.fftSize,
      frequencyBinCount: this.analyser.frequencyBinCount,
      bufferLength: this.bufferLength,
      minDecibels: this.analyser.minDecibels,
      maxDecibels: this.analyser.maxDecibels,
      smoothingTimeConstant: this.analyser.smoothingTimeConstant
    });

    console.log("🔬 Connecting input node to analyser...");
    node.connect(this.analyser);
    console.log("🔬 ANALYSER: Setup complete, ready for frequency analysis");
  }

  update() {
    this.updateCount++;
    this.analyser.getByteFrequencyData(this.dataArray);

    // Log detailed information every 2 seconds or first 10 updates
    const now = Date.now();
    const shouldLog = (now - this.lastLogTime > 2000) || this.updateCount <= 10;

    if (shouldLog) {
      this.lastLogTime = now;
      const hasData = this.dataArray.some(v => v > 0);
      const maxValue = Math.max(...Array.from(this.dataArray));
      const avgValue = Array.from(this.dataArray).reduce((a, b) => a + b, 0) / this.dataArray.length;
      const nonZeroCount = Array.from(this.dataArray).filter(v => v > 0).length;

      console.log(`🔬 ANALYSER UPDATE #${this.updateCount}:`, {
        hasData,
        maxValue,
        avgValue: avgValue.toFixed(2),
        nonZeroCount,
        totalBins: this.dataArray.length,
        dataPreview: Array.from(this.dataArray.slice(0, 8)),
        timeSinceCreation: ((now - this.creationTime) / 1000).toFixed(1) + "s",
        animationViable: hasData ? "✅ YES" : "❌ NO"
      });

      if (!hasData && this.updateCount > 50) {
        console.warn("🔬 WARNING: No frequency data after", this.updateCount, "updates. Check audio pipeline!");
      }
    }
  }

  get data() {
    return this.dataArray;
  }
}
