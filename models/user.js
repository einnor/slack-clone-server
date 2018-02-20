import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: 'The username can only contain letters and numbers',
        },
        len: {
          args: [3, 25],
          msg: 'The username needs to be between 3 and 25 characters long',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [8, 100],
          msg: 'The password needs to be between 8 and 100 characters long',
        },
      },
    },
  }, {
    hooks: {
      afterValidate: async (user) => {
        // eslint-disable-next-line no-param-reassign
        user.password = await bcrypt.hash(user.password, 12);
      },
    },
  });

  User.associate = (models) => {
    User.belongsToMany(models.Team, {
      through: 'members',
      foreignKey: {
        name: 'userId',
        field: 'user_id',
      },
    });
    User.belongsToMany(models.Channel, {
      through: 'channel_members',
      foreignKey: {
        name: 'teamId',
        field: 'team_id',
      },
    });
  };

  return User;
};
