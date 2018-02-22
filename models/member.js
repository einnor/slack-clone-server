export default (sequelize) => {
  const Member = sequelize.define('members', {});

  return Member;
};
