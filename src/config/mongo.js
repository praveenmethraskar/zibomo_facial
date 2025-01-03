/**
 * Manages MongoDB connection using Mongoose.
 * @module mongo
 */
import mongoose from "mongoose"
import config from "./config.js"
import container from "./container.js"

/**
 * MongoDB connection manager.
 * @type {Object}
 */
const mongoManager = {
  /**
   * Establishes a connection to MongoDB if not already connected.
   * Sets up event listeners for connection events.
   */
  run: () => {
    if (mongoose.connection.readyState === 0) {
      const connUri = config.db

      const connectionOptions = {
        //useNewUrlParser: true,
        //useUnifiedTopology: true
      }

      console.log(connUri)
      mongoose.connect(connUri, connectionOptions)

      mongoose.connection.on("connected", function () {
        let logger = container.resolve("logger")
        logger.debug(`Mongoose connected to ${connUri}`)
      })

      mongoose.connection.on("error", function (err) {
        let logger = container.resolve("logger")
        logger.error(
          `Error: Mongoose default connection has occurred ${err} error`
        )
      })

      mongoose.connection.on("disconnected", function () {
        let logger = container.resolve("logger")
        logger.info("Mongoose default connection is disconnected")
      })

      process.on("SIGINT", function () {
        mongoose.connection.close(function () {
          let logger = container.resolve("logger")
          logger.info(
            "Mongoose default connection is disconnected due to application termination"
          )
        })
      })
    }
  },

  /**
   * Closes the MongoDB connection if currently open, after a delay of 5 seconds.
   */
  close: () => {
    setTimeout(function () {
      if (mongoose.connection.readyState === 1) {
        let logger = container.resolve("logger")
        logger.info("Closing mongoose default connection")
        mongoose.connection.close()
      }
    }, getTimeout())
  },

  /**
   * Drops the entire database.
   * Use with caution in testing scenarios.
   */
  dropDatabase: async () => {
    try {
      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
      await mongoose.connect(config.db, connectionOptions)
      let db = mongoose.connection.db
      if (db) {
        const collections = await db.listCollections().toArray()

        for (const collection of collections) {
          const collectionName = collection.name
          await db.collection(collectionName).deleteMany({})
          console.log(
            `Deleted all documents from ${db.databaseName}-${collectionName}`
          )
        }

        console.log("All collections dropped successfully.")
      }
    } catch (error) {
      console.error("Error dropping database:", error)
    } finally {
      if (mongoose.connection.readyState === 1) {
        let logger = container.resolve("logger")
        logger.info("Closing mongoose default connection after dropping db")
        // mongoose.connection.close()
      }
    }
  },
}

const getTimeout = () => {
  if ((process.env.NODE_ENV === "testing")) {
    return 5000
  }
  return 5000
}

export default mongoManager
