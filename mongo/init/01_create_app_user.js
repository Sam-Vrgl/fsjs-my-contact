db = db.getSiblingDB(process.env.APP_DB || 'my_contacts_db');

db.createUser({
  user: process.env.APP_USER || 'app_user',
  pwd:  process.env.APP_PASSWORD || 'change_me_app',
  roles: [
    { role: 'dbOwner', db: process.env.APP_DB || 'my_contacts_db' }
  ]
});
