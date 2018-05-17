import formatErrors from '../formatErrors';
import { requiresAuth } from '../permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const member = await models.Member.findOne(
          { where: { teamId: args.teamId, userId: user.id } },
          { raw: true },
        );
        if (!member.admin) {
          return {
            ok: false,
            errors: [
              { path: 'name', message: 'You have to be the owner of the team to create a channel' },
            ],
          };
        }

        const response = await models.sequelize.transaction(async (transaction) => {
          const channel = await models.Channel.create(args, { transaction });
          if (!args.public) {
            const members = args.members.filter(m => m !== user.id);
            members.push(user.id);
            const privateChannelMembers = members.map(m => ({
              userId: m, channelId: channel.dataValues.id,
            }));
            await models.PrivateChannelMember.bulkCreate(privateChannelMembers, { transaction });
          }

          return channel;
        });

        return {
          ok: true,
          channel: response,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err),
        };
      }
    }),
  },
};
