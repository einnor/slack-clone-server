import formatErrors from '../formatErrors';
import { requiresAuth } from '../permissions';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      models.Team.findAll({ where: { owner: user.id } }, { raw: true })),
    // inviteTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
    //   models.Team.findAll({
    //     include: [{
    //       model: models.User,
    //       where: { id: user.id },
    //     }],
    //   }, { raw: true })),
    inviteTeams: requiresAuth.createResolver(async (parent, args, { models, user }) =>
      models.Team.sequelize.query(
        'select * from Teams join members on id = team_id where user_id = ?',
        {
          replacements: [user.id],
          model: models.Team,
        },
      )),
  },
  Mutation: {
    addTeamMember: requiresAuth.createResolver(async (parent,
      { email, teamId },
      { models, user },
    ) => {
      try {
        const teamPromise = models.Team.findOne({ where: { id: teamId } }, { raw: true });
        const userToAddPromise = models.User.findOne({ where: { email } }, { raw: true });
        const [team, userToAdd] = await Promise.all([teamPromise, userToAddPromise]);
        if (team.owner !== user.id) {
          return {
            ok: false,
            errors: [{ path: 'email', message: 'You cannot add members to the team' }],
          };
        }
        if (!userToAdd) {
          return {
            ok: false,
            errors: [{ path: 'email', message: 'Could not find user with this email' }],
          };
        }
        await models.Member.create({ userId: userToAdd.id, teamId });
        return {
          ok: true,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err),
        };
      }
    }),
    createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
      try {
        const teamResponse = await models.sequelize.transactions(async () => {
          const team = await models.Team.create({ ...args, owner: user.id });
          await models.Channel.create({ name: 'general', public: true, teamId: team.id });
          return team;
        });
        return {
          ok: true,
          team: teamResponse,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err),
        };
      }
    }),
  },
  Team: {
    channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id } }),
  },
};
