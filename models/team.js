export default (sequelize, DataTypes) => {
  const Team = sequelize.define('teams', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, { underscored: true });

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: 'members',
      foreignKey: 'teamId',
    });
    Team.belongsToMany(models.User, {
      through: 'members',
      foreignKey: 'owner',
    });
  };

  return Team;
};
