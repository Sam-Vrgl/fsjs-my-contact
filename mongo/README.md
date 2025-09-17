### Launch
docker compose up -d

### Check
docker compose ps

### Log
docker exec -it contacts_app_mongo mongosh -u root -p change_me_root --authenticationDatabase admin

use contacts_db
db.auth('app_user', 'change_me_app')
show collections

### URI

MONGO_URI=mongodb://app_user:change_me_app@localhost:27017/contacts_db?authSource=contacts_db