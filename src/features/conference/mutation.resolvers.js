const { prisma } = require('../../prisma')
const { map } = require('ramda')

const conferenceMutationResolvers = {
  Mutation: {
    saveConference: async (_parent, { input }, { dataSources }, _info) => {
      const { id: conferenceId, location, typeId, categoryId, speakers, deletedSpeakers, ...restConference } = input
      const { id: locationId, ...restLocation } = location //adica restul din locatie pe langa id = restlocation

      const result = await prisma().$transaction(async prismaClient => {
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

        await prismaClient.ConferenceXSpeaker.deleteMany({
          where: { conferenceId: conferenceId, speakerId: { in: deletedSpeakers } }
        })

        await Promise.all(
          map(async ({ id: speakerId, isMainSpeaker, ...restSpeaker }) => {
            const upsertedSpeaker = await prismaClient.speaker.upsert({
              where: { id: speakerId },
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

        return prismaClient.conference.findUnique({
          where: { id: upsertedConference.id },
          include: { conferenceXSpeaker: { include: { speaker: true } } }
        })
      })
      const updatedSpeakers = result.conferenceXSpeaker.map(s => s.speaker)
      await Promise.all(
        map(async speaker => {
          await dataSources.conferenceAPI.sendSmsNotification({
            conferenceId: result.id,
            receiverId: speaker.id
          })
        }, updatedSpeakers)
      )
      return result
    },

    changeAttendanceStatus: async (_parent, { input }, _ctx, _info) => {
      await prisma().conferenceXAttendee.upsert({
        where: {
          conferenceId_attendeeEmail: {
            conferenceId: input.conferenceId,
            attendeeEmail: input.attendeeEmail
          }
        },
        update: { statusId: input.statusId },
        create: {
          conferenceId: input.conferenceId,
          attendeeEmail: input.attendeeEmail,
          statusId: input.statusId
        }
      })
      return null
    }
  }
}

module.exports = conferenceMutationResolvers
