import { describe, it } from 'mocha'
import { interpolateColor, temperatureToColor } from '../../src/utils/color'
import { expect } from 'chai'

describe('Color interpolation functions', () => {
  describe('interpolateColor', () => {
    it('should return color1 when factor is 0', () => {
      const color1 = [255, 0, 0]
      const color2 = [0, 255, 0]
      const result = interpolateColor(color1, color2, 0)
      expect(result).to.deep.equal(color1)
    })

    it('should return color2 when factor is 1', () => {
      const color1 = [255, 0, 0]
      const color2 = [0, 255, 0]
      const result = interpolateColor(color1, color2, 1)
      expect(result).to.deep.equal(color2)
    })

    it('should return correct interpolated color when factor is 0.5', () => {
      const color1 = [255, 0, 0]
      const color2 = [0, 255, 0]
      const result = interpolateColor(color1, color2, 0.5)
      expect(result).to.deep.equal([128, 128, 0])
    })

    it('should return a rounded interpolated color for a non-integer factor', () => {
      const color1 = [10, 20, 30]
      const color2 = [110, 120, 130]
      const result = interpolateColor(color1, color2, 0.3)
      expect(result).to.deep.equal([40, 50, 60])
    })
  })

  describe('temperatureToColor', () => {
    const minTemp = 30
    const maxTemp = 100

    it('should return blue for the minimum temperature', () => {
      const result = temperatureToColor(minTemp, minTemp, maxTemp)
      expect(result).to.deep.equal([0, 0, 255])
    })

    it('should return orange for the maximum temperature', () => {
      const result = temperatureToColor(maxTemp, minTemp, maxTemp)
      expect(result).to.deep.equal([255, 165, 0])
    })

    it('should return green for the mid-range temperature', () => {
      const midTemp = (maxTemp + minTemp) / 2
      const result = temperatureToColor(midTemp, minTemp, maxTemp)
      expect(result).to.deep.equal([0, 255, 0])
    })

    it('should interpolate color for temperatures within segments', () => {
      const tempInYellowRange = 85 // Between yellow and orange
      const result = temperatureToColor(tempInYellowRange, minTemp, maxTemp)
      expect(result).to.deep.equal([255, 242, 0])
    })

    it('should clamp to the coldest color for temperature below the minimum', () => {
      const belowMinTemp = minTemp - 10
      const result = temperatureToColor(belowMinTemp, minTemp, maxTemp)
      expect(result).to.deep.equal([0, 0, 255])
    })

    it('should clamp to the warmest color for temperature above the maximum', () => {
      const aboveMaxTemp = maxTemp + 10
      const result = temperatureToColor(aboveMaxTemp, minTemp, maxTemp)
      expect(result).to.deep.equal([255, 165, 0])
    })
  })
})
