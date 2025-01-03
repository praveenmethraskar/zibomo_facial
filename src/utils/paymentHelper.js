import logger from "../logging/logger.js"

/**
 * Calculates the total additional price based on the size of the item, duration of use,
 * and provided price thresholds.
 *
 * This function determines the duration of use in hours and calculates an additional price
 * if the duration exceeds a specified hourly threshold. The calculation is based on
 * size-specific rates provided in the `additionalPrices`.
 *
 * @param {string} size - The size category of the item (e.g., "small", "medium", "large").
 * @param {Date} pickupTime - The pickup date and time of the item.
 * @param {Date} dropOffTime - The drop-off date and time of the item.
 * @param {Object} additionalPrices - An object containing threshold and price information for various size categories.
 * @returns {number|null} - Returns the total additional price if the duration exceeds the hourly threshold; otherwise, returns null.
 */
export const calculateTotalAdditionalPrice = (
  size,
  pickupTime,
  dropOffTime,
  additionalPrices
) => {
  const durationInHours = Math.round(calculateDuration(pickupTime, dropOffTime))

  const thresholds = getThresholds(additionalPrices)

  logger.debug(JSON.stringify(durationInHours))
  logger.debug(JSON.stringify(thresholds))

  logger.info("Total Duration in hours: " + durationInHours)

  // Return null if usage is less than the hourly start threshold
  if (durationInHours < thresholds.hourly?.start) {
    return 0
  }

  let totalAdditionalPrice = 0 // Initialize the total amount to 0

  // Prices based on size for hourly calculation
  const sizePriceMap = thresholds.hourly.prices

  logger.debug(JSON.stringify(sizePriceMap))

  if (durationInHours >= thresholds.hourly?.start) {
    logger.debug("Checking hourly start: " + thresholds.hourly?.start)

    // Apply hourly rate
    const remainingHours = Math.ceil(durationInHours - thresholds.hourly?.start) // Round up remaining hours
    logger.debug("Remaining hours: " + remainingHours)

    totalAdditionalPrice += sizePriceMap[size] * remainingHours
    logger.debug(totalAdditionalPrice)
  }

  return totalAdditionalPrice
}

/**
 * Calculates the duration between two given dates in hours.
 *
 * This function computes the difference between the pickup time and drop-off time
 * in milliseconds, then converts it to hours.
 *
 * @param {Date|string} pickupTime - The pickup date and time of the item. Can be a Date object or a date string.
 * @param {Date|string} dropOffTime - The drop-off date and time of the item. Can be a Date object or a date string.
 * @returns {number} - The duration between pickup and drop-off times in hours. A positive number indicates
 *                     the pickup time is later than the drop-off time, while a negative number indicates the
 *                     drop-off time is later than the pickup time.
 */
// Function to calculate the duration between pickup and drop-off in hours
function calculateDuration(pickupTime, dropOffTime) {
  return (new Date(pickupTime) - new Date(dropOffTime)) / (1000 * 60 * 60)
}

/**
 * Extracts and structures threshold information for hourly additional prices.
 *
 * This function organizes the additional pricing data into a structured format with `hourly` threshold information.
 * The `hourly` object includes:
 * - `start`: the start threshold for applying additional prices (e.g., a minimum number of hours).
 * - `prices`: a mapping of item sizes to their respective prices.
 * - `end`: the operator or end threshold related to the pricing model.
 *
 * @param {Object} additionalPrices - The pricing data containing time thresholds, prices, and operator values.
 * @param {number} additionalPrices.time - The starting threshold (in hours) for applying the hourly rate.
 * @param {Array} additionalPrices.prices - An array of price entries, where each entry contains:
 *        @param {string} prices.size - The size category of the item.
 *        @param {number} prices.price - The hourly rate associated with the size category.
 * @param {string} additionalPrices.operator - The ending threshold or operator used in pricing calculations.
 * @returns {Object} - A structured object containing hourly threshold information, including the start threshold,
 *                     a mapping of size categories to their respective prices, and the operator or end threshold.
 */
// Function to get the threshold prices for different frequencies (hourly/daily)
function getThresholds(additionalPrices) {
  return {
    hourly: {
      start: additionalPrices.time,
      prices: additionalPrices.prices.reduce((acc, priceEntry) => {
        acc[priceEntry.size] = priceEntry.price
        return acc
      }, {}),
      end: additionalPrices.operator,
    },
  }
}
