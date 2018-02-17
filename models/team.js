export default (sequelize, DataTypes) => {
  const Team = sequelize.define('teams', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: 'member',
      foreignKey: 'teamId',
    });
    Team.belongsToMany(models.User, {
      through: 'member',
      foreignKey: 'owner',
    });
  };

  return Team;
};
