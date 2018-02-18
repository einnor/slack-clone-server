export default `
  type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
  }

  type Mutation {
    createMessage(channelId: Int!, userId: Int!, text: String!): Boolean!
  }
`;
