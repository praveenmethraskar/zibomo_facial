import User from "../models/userModel.js"

/**
 * Repository class for handling user-related operations.
 * This class provides methods for adding users and retrieving user data by different fields.
 */
export default class UserRepository {
  
   /**
   * Adds a new user to the database.
   * 
   * @param {string} name - The name of the user.
   * @param {string} phone - The phone number of the user.
   * @param {string} email - The email address of the user.
   * 
   * @returns {Promise<Object>} - Returns a Promise that resolves to the newly created user document.
   */
  async addUser(name, phone, email) {
    const user = new User({ name, phone, email })
    return await user.save()
  }

  /**
   * Finds a user by their email address.
   * 
   * @param {string} email - The email address of the user to be retrieved.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the user document if found, or `null` if no user is found.
   */
  async findByEmail(email) {
    return User.findOne({ email })
  }

  /**
   * Finds a user by their phone number.
   * 
   * @param {string} phone - The phone number of the user to be retrieved.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the user document if found, or `null` if no user is found.
   */
  async findByPhone(phone) {
    return User.findOne({ phone })
  }

  /**
   * Finds a user by their name.
   * 
   * @param {string} name - The name of the user to be retrieved.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the user document if found, or `null` if no user is found.
   */
  async findByName(name) {
    return User.findOne({ name })
  }
}
