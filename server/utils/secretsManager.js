const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager")

class SecretsManager {
  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async getMongoDBUrl() {
    try {
      if (process.env.MONGODB_URI) {
        console.log("Using MongoDB URI from environment variable")
        return process.env.MONGODB_URI
      }

      console.log("Fetching MongoDB URI from AWS Secrets Manager...")
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: process.env.MONGODB_SECRET_NAME,
          VersionStage: "AWSCURRENT",
        }),
      )

      const secret = JSON.parse(response.SecretString)
      console.log(`Successfully retrieved MongoDB URI from AWS Secrets Manager ${secret.name}`)
      return secret.MONGO_URI
    } catch (error) {
      console.error("Error retrieving MongoDB secret:", error)
      // Fallback to default MongoDB URI if everything fails
      const fallbackUri = process.env.MONGODB_URI || "mongodb://localhost:27017/speakx"
      console.log("Using fallback MongoDB URI:", fallbackUri)
      return fallbackUri
    }
  }
}

module.exports = new SecretsManager()

