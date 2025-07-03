// This function calculates a color from green to red based on the variable cost ratio (VCR).
// Green (hsl(140, 80%, 40%)) for VCR <= 70%
// Yellow (hsl(60, 80%, 45%)) for VCR = 100%
// Red (hsl(0, 80%, 50%)) for VCR >= 130%
// Purple (hsl(280, 80%, 55%)) for VCR >= 160%
export function getDynamicColorByVCR(vcr: number): string {
    // Healthy Zone: <= 85% (Green)
    // Below 90%, the lower the value, the darker the color.
    if (vcr <= 85) {
      // Range from 85 down to 50 for max darkness
      const percentage = Math.max(0, (85 - vcr) / (85 - 50));
      const lightness = 40 - 15 * percentage; // from 40% down to 25%
      return `hsl(140, 80%, ${lightness}%)`;
    }
    // Caution Zone: 85% < VCR <= 90% (Blue)
    // The closer to 85, the healthier/darker.
    if (vcr <= 90) {
      const percentage = (vcr - 85) / 5; // 0 at 85, 1 at 90
      const lightness = 45 - 15 * (1 - percentage); // from 45% down to 30%
      return `hsl(210, 80%, ${lightness}%)`;
    }
    
    // High-risk zones: > 90%
    // Above 90%, the higher the value, the darker the color.
  
    // Warning Zone: 90% < VCR <= 94% (Yellow)
    if (vcr <= 94) {
      const percentage = (vcr - 90) / 4;
      const lightness = 50 - 15 * percentage; // from 50% down to 35%
      return `hsl(60, 80%, ${lightness}%)`;
    }
    // Danger Zone: 94% < VCR <= 100% (Red)
    if (vcr <= 100) {
      const percentage = (vcr - 94) / 6;
      const lightness = 50 - 15 * percentage; // from 50% down to 35%
      return `hsl(0, 80%, ${lightness}%)`;
    }
    // Catastrophic Zone: > 100% (Purple-Red)
    // Cap at VCR 130 for max darkness
    const percentage = Math.min(1, (vcr - 100) / 30);
    const lightness = 55 - 20 * percentage; // from 55% down to 35%
    return `hsl(330, 80%, ${lightness}%)`;
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
