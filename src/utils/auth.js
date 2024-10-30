const role = {
    ADMIN: 'admin',
    CREATOR: 'Creador',
    READER: 'Lector'
  };
  
  const permissions = {
    ADMIN: ['CRUD'],
    CREATOR: ['CRU'],
    READER: ['R']
  };
  
  module.exports = {
    role,
    permissions
  };
  