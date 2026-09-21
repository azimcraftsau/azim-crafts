const fs = require('fs');
const path = require('path');
const { randomBytes, pbkdf2Sync, createHash } = require('crypto');

const hashPassword = (pw) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return 'pbkdf2:' + salt + ':' + hash;
};

const usersPath = 'c:\\Users\\HP\\Downloads\\vintage\\backend\\database\\.local_db\\users.json';
const dir = path.dirname(usersPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let users = [];
if (fs.existsSync(usersPath)) {
  try { users = JSON.parse(fs.readFileSync(usersPath, 'utf8')); } catch(e){}
}

let admin = users.find(u => u.email === 'admin@azimcrafts.com');
if (!admin) {
  admin = {
    id: 'usr_admin',
    name: 'Store Admin',
    email: 'admin@azimcrafts.com',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  users.push(admin);
}
admin.name = 'Store Admin';
admin.role = 'admin';
admin.password = hashPassword('VTM@admin2026');

users = users.map(u => {
  if (u.password && !u.password.startsWith('pbkdf2:') && u.password.length < 64) {
    u.password = hashPassword(u.password);
  }
  return u;
});

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
