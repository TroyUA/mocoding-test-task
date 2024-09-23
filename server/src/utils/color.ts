function interpolateColor(color1: number[], color2: number[], factor: number) {
  return [
    Math.round(color1[0] + factor * (color2[0] - color1[0])),
    Math.round(color1[1] + factor * (color2[1] - color1[1])),
    Math.round(color1[2] + factor * (color2[2] - color1[2])),
  ]
}

export function temperatureToColor(temperature: number) {
  const colorStops = [
    [0, 0, 255], // Blue (Coldest)
    [0, 255, 255], // Aqua
    [0, 255, 0], // Green
    [255, 255, 0], // Yellow
    [255, 165, 0], // Orange (Warmest)
  ]

  const minTemp = 30 // Coldest temperature, adjust as needed
  const maxTemp = 100 // Warmest temperature, adjust as needed

  // Calculate the range of temperatures and divide into four segments
  const tempRange = maxTemp - minTemp
  const segmentSize = tempRange / (colorStops.length - 1)

  // Find which segment the temperature falls into
  const segmentIndex = Math.floor((temperature - minTemp) / segmentSize)

  // Ensure the segment index stays within bounds
  const clampedSegmentIndex = Math.max(
    0,
    Math.min(segmentIndex, colorStops.length - 2)
  )

  // Calculate the interpolation factor within the segment
  const segmentStartTemp = minTemp + clampedSegmentIndex * segmentSize
  const factor = (temperature - segmentStartTemp) / segmentSize

  // Interpolate between the two colors of the segment
  const color1 = colorStops[clampedSegmentIndex]
  const color2 = colorStops[clampedSegmentIndex + 1]

  return interpolateColor(color1, color2, factor)
}
