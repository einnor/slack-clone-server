export default `
    type Channel {
    id: Int!
    name: String!
    public: Boolean!
    dm: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type ChannelResponse {
    ok: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type Mutation {
    createChannel(teamId: Int!, name: String!, public: Boolean=false, members: [Int!]=[]): ChannelResponse
    getOrCreateDirectMessageChannel(teamId: Int!, members: [Int!]!): Int!
  }
`;
