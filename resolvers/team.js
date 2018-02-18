export default {
  Mutation: {
    createTeam: async (parent, args, { models, user }) => {
      try {
        models.Team.create({ ...args, owner: user.id });
        return true;
      } catch (err) {
        return false;
      }
    },
  },
};
