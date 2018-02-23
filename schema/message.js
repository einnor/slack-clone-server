export default `
  type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
  }

  type Query {
    messages(channelId: Int!): [Message!]!
  }

  type Mutation {
    createMessage(channelId: Int!, userId: Int!, text: String!): Boolean!
  }
`;
