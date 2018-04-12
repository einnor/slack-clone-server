const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

export const requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
});

export const requiresTeamAccess = createResolver(async (
  parent, { channelId }, { models, user },
) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }

  // check if part of the teamId
  const channel = await models.Channel.findOne({ where: { id: channelId } });
  const member = await models.Member.findOne({
    where: { teamId: channel.teamId, userId: user.id },
  });
  if (!member) {
    throw new Error("You have to be a member of the team to sybscribe to it's messages");
  }
});

export const directMessageSubscription = createResolver(async (
  parent, { teamId, userId }, { models, user },
) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }

  // check if part of the same team
  const members = await models.Member.findAll({
    where: {
      teamId,
      [models.sequelize.Op.or]: [{ userId }, { userId: user.id }],
    },
  });
  if (members.length !== 2) {
    throw new Error('The two users do not belong to the same team');
  }
});

export const requiresAdmin = requiresAuth.createResolver((parent, args, { user }) => {
  if (!user.isAdmin) {
    throw new Error('Requires admin access');
  }
});
