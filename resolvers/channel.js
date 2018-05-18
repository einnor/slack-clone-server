import formatErrors from '../formatErrors';
import { requiresAuth } from '../permissions';

export default {
  Mutation: {
    getOrCreateDirectMessageChannel: requiresAuth.createResolver(async (parent, { teamId, members }, { models, user }) => {
      members.push(user.id);
      // Check if dm channel already exists eith these members
      const [data] = await models.sequelize.query(`
        select c.id from channels as c, private_channel_members as pcm
        where pcm.channel_id = c.id
        and c.dm = true
        and c.public = false
        and c.team_id = ${teamId}
        group by c.id
        having array_agg(pcm.user_id) @> Array[${members.join(',')}]
        and count(pcm.user_id) = ${members.length}
      `, { raw: true });

      if (data.length) {
        return data[0].id;
      }

      const channelId = await models.sequelize.transaction(async (transaction) => {
        const channel = await models.Channel.create({
          name: '',
          public: false,
          dm: true,
          teamId,
        }, { transaction });

        const cId = channel.dataValues.id;

        const privateChannelMembers = members.map(m => ({
          userId: m, channelId: cId,
        }));
        await models.PrivateChannelMember.bulkCreate(privateChannelMembers, { transaction });
        return cId;
      });

      return channelId;
    }),
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
