const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    users: [User]
    messages: [Message]
    currentUser: User
  }

  type User {
    id: ID
    userName: String!
    email: String!
    hashedPassword: String!
  }

  type Message {
    id: ID,
    userName: String
    message: String
  }

  type Room {
    id: ID
    roomName: String
    messages: [Message]!
  }

  input UserInput {
    userName: String,
    email: String
  }

  type LoginResponse {
    token: String
    user: User
  }

  type Mutation {
    register(userName: String! email: String! password: String!): User!
    login(userName: String!, password: String!): LoginResponse!
    updateUser(id: ID! name: String!): User!
    deleteUser(email: String!): Boolean!
    userTyping(email: String! receiverMail: String!): Boolean!

    createMessage(user: UserInput! roomName: String! message: String): [Message]!
    getMessage(roomName: String!) : [Message]!
    updateMessage(id: ID! message: String!): Message!
    deleteMessage(id: String!): Boolean!
  }

  type Subscription {
    newMessage(roomName: String!): Message
    newUser: User
    oldUser: String
    userTyping (receiverMail: String!): String
  }
`
