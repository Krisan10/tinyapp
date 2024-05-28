const { urlDatabase } = require('./databases');

const randomNumberGenerator = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

const getUserByEmail = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return null;
};

const urlsForUser = (id) => { // returns object of urls belonging to user_id
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {  //if the given id exists in url database
      urls[shortURL] = urlDatabase[shortURL].longURL; //adding it's url to urls object
    }
  }
  return urls;
};

module.exports = {
  randomNumberGenerator,
  getUserByEmail,
  urlsForUser,
};