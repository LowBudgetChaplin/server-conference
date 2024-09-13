const ConferenceAPI = require('../features/conference/conferenceAPI')

module.exports.getDataSources = context => ({
  conferenceAPI: new ConferenceAPI(context)
})
