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

module.exports = {
  randomNumberGenerator,
  getUserByEmail
}