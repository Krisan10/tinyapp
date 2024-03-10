const bcrypt = require('bcrypt');

const findUserByEmail = function (users, email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const authenticateUser = function (users, email, password) {
  const user = findUserByEmail(users, email);

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }

  return null;
};

const randomString = function() {
  const numlets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * numlets.length);
    result += numlets.charAt(randomIndex);
  }

  return result;
};

module.exports = {
  findUserByEmail,
  authenticateUser,
  randomString
}