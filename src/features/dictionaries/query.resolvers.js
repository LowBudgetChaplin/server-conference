const {prisma} = require('../../prisma')


const dictionaryQueryResolvers={
    Query:{
        typeList:()=> prisma().dictionaryConferenceType.findMany(),
        categoryList:()=> prisma().dictionaryCategory.findMany(),
        cityList:()=> prisma().dictionaryCity.findMany(),
        countyList:()=> prisma().dictionaryCounty.findMany(),
        countryList:()=> prisma().dictionaryCountry.findMany()
    }
}

module.exports = dictionaryQueryResolvers