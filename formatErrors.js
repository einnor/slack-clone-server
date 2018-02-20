import _ from 'lodash';

export default (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(error => _.pick(error, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong' }];
};
