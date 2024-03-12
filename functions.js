const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "",
  },
};

const saltRounds = 10; 
const users = {
  "user@example.com": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", saltRounds)
  },
  "user2@example.com": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("456", saltRounds)
  },
};


const findUserByEmail = function (users, email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const authenticateUser = function(user){
  !!user;
}

const randomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6; // Adjust the length as needed

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

const urlsForUser = function (id, database) {
  const userURLs = {};

  for (const shortURL in database) {
    const urlData = database[shortURL];
    if (urlData.userID === id) {
      userURLs[shortURL] = urlData.longURL;
    }
  }

  return userURLs;
};

module.exports = {
  findUserByEmail,
  authenticateUser,
  randomString,
  urlsForUser,
};

