const { connect } = require('tedious')
const { prisma } = require('../../prisma')
const { map } = require('ramda')

const conferenceMutationResolvers = {
  Mutation: {
    saveConference: (_parent, { input }, _ctx, _info) => {
      const { id: conferenceId, location, typeId, categoryId, deletedSpeakers, speakers, ...restConference } = input
      const { id: locationId, ...restLocation } = location

      const result = prisma().$transaction(async prismaClient => {
        const upsertedLocation = await prismaClient.location.upsert({
          where: { id: locationId || -1 },
          update: restLocation,
          create: restLocation
        })

        const conferenceInput = {
          ...restConference,
          dictionaryConferenceType: {
            connect: { id: typeId }
          },
          dictionaryCategory: {
            connect: { id: categoryId }
          },
          location: {
            connect: { id: upsertedLocation.id }
          }
        }

        const upsertedConference = await prismaClient.conference.upsert({
          where: { id: conferenceId || -1 },
          update: conferenceInput,
          create: conferenceInput
        })

        await prismaClient.conferenceXSpeaker.deleteMany({ where: { conferenceId, speakerId: { in: deletedSpeakers } } })

        await Promise.all(
          map(async ({ id: speakerId, isMainSpeaker, ...restSpeaker }) => {
            const upsertedSpeaker = await prismaClient.speaker.upsert({
              where: { id: speakerId || -1 },
              update: restSpeaker,
              create: restSpeaker
            })

            await prismaClient.conferenceXSpeaker.upsert({
              where: { conferenceId_speakerId: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id } },
              update: { isMainSpeaker },
              create: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id, isMainSpeaker }
            })
          }, speakers)
        )

        return upsertedConference
      })
      return result
    }
  }
}
module.exports = conferenceMutationResolvers
