export default `
  type DirectMessage {
    id: Int!
    text: String!
    sender: User!
    receiverId: Int!
  }

  type Query {
    directMessages: [DirectMessage!]!
  }

  type Mutation {
    createDirectMessage(receiverId: Int!, teamId: Int!, text: String!): Boolean!
  }
`;
