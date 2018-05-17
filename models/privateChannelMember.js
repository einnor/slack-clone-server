export default (sequelize) => {
  const PrivateChannelMember = sequelize.define('private_channel_members', {});

  return PrivateChannelMember;
};
