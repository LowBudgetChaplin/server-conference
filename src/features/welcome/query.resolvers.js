const welcomeQueryResolvers = {
  Query: {
    helloWorld: async (_parent, _arguments, _context, _info) => {
      return 'Welcome!'
    }
  }
}

module.exports = welcomeQueryResolvers
