// This function calculates a color from green to red based on the variable cost ratio (VCR).
// Green (hsl(140, 80%, 40%)) for VCR <= 70%
// Yellow (hsl(60, 80%, 45%)) for VCR = 100%
// Red (hsl(0, 80%, 50%)) for VCR >= 130%
// Purple (hsl(280, 80%, 55%)) for VCR >= 160%
export function getDynamicColorByVCR(vcr: number): string {
  if (vcr <= 70) {
    return 'hsl(140, 80%, 40%)'; // Healthy Green
  }
  if (vcr <= 100) {
    // Interpolate from Green to Yellow
    const percentage = (vcr - 70) / (100 - 70);
    const hue = 140 - (140 - 60) * percentage;
    const lightness = 40 + (45 - 40) * percentage;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  }
  if (vcr <= 130) {
    // Interpolate from Yellow to Red
    const percentage = (vcr - 100) / (130 - 100);
    const hue = 60 - 60 * percentage;
    const lightness = 45 + (50 - 45) * percentage;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  }
  if (vcr <= 160) {
    // Interpolate from Red to Purple
    const percentage = (vcr - 130) / (160 - 130);
    const hue = 360 - (360 - 280) * percentage; // Hue for red is 0 or 360
    const lightness = 50 + (55 - 50) * percentage;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  }
  return 'hsl(280, 80%, 55%)'; // High-risk Purple
}


export function getDynamicColorForDonutLegend(outerRatio: number, innerRatio: number, ring: 'inner' | 'outer'): string {
    const diff = innerRatio - outerRatio;

    // If one ring is significantly larger than the other, color it.
    if (Math.abs(diff) > 10) { // Threshold for significant difference
        if (diff > 0 && ring === 'inner') {
            return 'hsl(var(--destructive))'; // Inner ring is disproportionately large (bad)
        }
        if (diff < 0 && ring === 'outer') {
           // return 'hsl(var(--destructive))'; // Outer ring is disproportionately large, could be bad depending on context
        }
    }
    
    // If the ratio itself is very high, it might be a concern.
    if (ring === 'inner' && innerRatio > 75) {
        return 'hsl(var(--destructive))'; // e.g. a single business line is 75% of total losses
    }

    return 'hsl(var(--foreground))'; // Default color
}
