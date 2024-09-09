const {prisma} = require('../../prisma')


const conferenceQueryResolvers = {
    Query:{
        conferenceList: async(_parent, {filters}, _ctx, _info) =>{
            let localWhere = undefined
            if(filters) localWhere = {}
            if(filters?.startDate) localWhere.startDate = {gte: filters.startDate}
            if(filters?.endDate) localWhere.endDate = {lte: filters.endDate}
            return prisma().conference.findMany({where: localWhere})
        }
    },
    Conference:{
        type:({conferenceTypeId}) =>{
            return prisma().dictionaryConferenceType.findUnique({where:{id : conferenceTypeId}})
        },
        category:({categoryId}) =>{
            return prisma().dictionaryCategory.findUnique({where:{id: categoryId}})
        },
        location: ({locationId})=>{
            return prisma().location.findUnique({where:{id: locationId}})
        },
        status: async ({ id }, { userEmail }) => {
            const result = await prisma().conferenceXAttendee.findUnique({
              where: {
                conferenceId: id,
                attendeeEmail: userEmail
              },
              include: { dictionaryStatus: true }
            })
            return result?.dictionaryStatus
          }
    },
    Location:{
        city:{
            city:({cityId})=>{
                return prisma().dictionaryCity.findUnique({where:{id:cityId}})
            }
        },
        country:{
            country:({countryId})=>{
                return prisma().dictionaryCountry.findUnique({where:{id:countryId}})
            }
        },
        county:{
            county:({countyId})=>{
                return prisma().dictionaryCounty.findUnique({where:{id:countyId}})
            }
        },
    // Status:{

    //     }
    }
}
module.exports = conferenceQueryResolvers