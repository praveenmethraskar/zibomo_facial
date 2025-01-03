import Terminal from "../models/terminal.js"

/**
 * Repository class for handling terminal-related operations.
 * This class provides methods to create and retrieve terminal data from the database.
 */
export default class TerminalRepository {
  constructor() {}

  /**
   * Creates a new terminal and saves it to the database.
   * 
   * @param {Object} terminalData - The data of the terminal to be created.
   * @param {string} terminalData.terminalId - The unique identifier for the terminal.
   * @param {string} terminalData.name - The name of the terminal.
   * @param {string} terminalData.location - The location of the terminal.
   * @param {Object} terminalData.otherFields - Additional fields relevant to the terminal (e.g., status, configuration, etc.).
   * 
   * @returns {Promise<Object>} - Returns a Promise that resolves to the newly created terminal document.
   */
  async createTerminal(terminalData) {
    const terminal = new Terminal(terminalData)
    await terminal.save()
    return terminal
  }

  /**
   * Finds a terminal by its unique terminalId.
   * 
   * @param {string} terminalId - The unique identifier of the terminal to be retrieved.
   * 
   * @returns {Promise<Object|null>} - Returns a Promise that resolves to the terminal document if found, or `null` if no terminal is found.
   */
  async findTerminalByTerminalId(terminalId) {
    return await Terminal.findOne({ terminalId })
  }
}
