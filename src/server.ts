const { ApolloServer, gql, AuthenticationError, PubSub, ParamsDictionary } = require('apollo-server')
const jwt = require('jsonwebtoken')
export const mongoose = require('mongoose')
const uri = "mongodb+srv://admin:silotech@cluster0.ulm8l.mongodb.net/chat_app?retryWrites=true&w=majority";
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const pubsub = new PubSub()

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const getUser = (token: string)  => {
    try {
        if(token) {
            return jwt.verify(token, 'secret')
        }
        return null
    }   catch (err) {
        return null
    }
}

const server = new ApolloServer({ typeDefs, resolvers, context: 
    async ({ req , connection } : {req: any, connection: any}) => {
        if(connection) {
            connection.context = { pubsub }
            return connection.context
        } else {
            const tokenWithBearer = req.headers.authorization || ''
            const token = tokenWithBearer.split(' ')[1]
            const user = getUser(token)

            return { user }
        }
    }
})

server.listen().then(({ url } : {url: any}) => {
    console.log(`🚀  Server ready at ${url}`);
    // User.find().then( user => console.log(user))
});
  