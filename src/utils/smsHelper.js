import logger from "../logging/logger.js"
import https from "https"

export default class smsHelper {
  /**
   * Sends a message based on the type (login or collectPin) with the given parameters.
   * @param {string} phone - The recipient's phone number.
   * @param {string} otp - The OTP for login.
   * @param {Object} [availableLocker] - Locker information (only for collectPinMessage).
   * @param {string} [collectPin] - Collect pin (only for collectPinMessage).
   * @param {string} type - Type of message ('login' or 'collectPin').
   * @returns {Promise} - Resolves or rejects based on the SMS API response.
   */
  sendLoginMessage(phone, otp) {
    return this.sendMessage(phone, otp)
  }

  /**
   * Sends a collect pin message.
   * @param {string} phone - The recipient's phone number.
   * @param {string} lockerNumber - Locker number where package is.
   * @param {string} collectPin - The collect pin for package pickup.
   * @returns {Promise} - Resolves or rejects based on the SMS API response.
   */
  sendCollectPinMessage(phone, lockerNumber, collectPin) {
    return this.sendMessage(phone, lockerNumber, collectPin)
  }

  /**
   * General method to send message.
   * @param {string} phone - The recipient's phone number.
   * @param {string} otpOrLockerNumber - OTP for login or Locker number.
   * @param {string} [collectPin] - Collect pin (only for collectPinMessage).
   * @returns {Promise} - Resolves or rejects based on the SMS API response.
   */
  sendMessage(phone, otpOrLockerNumber, collectPin = null) {
    return new Promise((resolve, reject) => {
      const options = {
        method: "POST",
        hostname: "control.msg91.com",
        path: "/api/v5/flow",
        headers: {
          authkey: process.env.AUTH_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
      }

      let message
      let recipientsData
      let templateId

      if (collectPin) {
        message = this.collectPinMessage(otpOrLockerNumber, collectPin)
        recipientsData = {
          mobiles: phone,
          var1: collectPin,
          var2: otpOrLockerNumber,
        }
        templateId = process.env.COLLECT_PIN_TEMPLATE_ID
        logger.debug(`Sending collectPin message: ${message}`)
      } else {
        message = this.loginMessage(otpOrLockerNumber)
        recipientsData = {
          mobiles: phone,
          OTP: otpOrLockerNumber,
        }
        templateId = process.env.LOGIN_TEMPLATE_ID
        logger.debug(`Sending login message: ${message}`)
      }

      const req = https.request(options, (res) => {
        const chunks = []
        res.on("data", (chunk) => {
          chunks.push(chunk)
        })
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString()
          if (res.statusCode === 200) {
            resolve(body)
          } else {
            reject(new Error(`SMS API error: ${body}`))
          }
        })
      })

      req.on("error", (err) => {
        reject(err)
      })

      const data = JSON.stringify({
        template_id: templateId,
        recipients: [recipientsData],
      })

      req.write(data)
      req.end()
    })
  }
  /**
   * Constructs a login message.
   * @param {string} otp - The OTP for login.
   * @returns {string} - The constructed login message.
   */
  loginMessage(otp) {
    return `Your OTP for login to Zibomo Sprint Safe is ${otp}. Please do not share this OTP with anyone. Regards, Appprotech.`
  }

  /**
   * Constructs a collect pin message.
   * @param {Object} availableLocker - Locker information.
   * @param {string} collectPin - The collect pin.
   * @returns {string} - The constructed collect pin message.
   */
  collectPinMessage(lockerNumber, collectPin) {
    return `Hi, A package has been dropped in zibomo sprint safe for you in locker no${lockerNumber.toString()}, Please use this four digit pin ${collectPin.toString()} to pickup your package.Regards,Appprotech.`
  }
}
