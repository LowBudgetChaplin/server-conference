

const welcomeQueryResolvers={
    Query:{
        helloWorld: async(_parent, _arguments, _context, _info)=>{
            return 'Hello world 🤡'
        }
    }
}


module.exports = welcomeQueryResolvers

