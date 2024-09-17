const { RESTDataSource } = require('@apollo/datasource-rest')

class ConferenceAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.API_URL
  }

  async sendSmsNotification(body) {
    const response = await this.post('Notification/SendSpeakerSmsNotification', { body })
    return response
  }
  async sendEmailNotification(body) {
    const response = await this.post('Notification/SendSpeakerEmailNotification', { body })
    return response
  }
}

module.exports = ConferenceAPI
