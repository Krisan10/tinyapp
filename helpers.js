const findUserByEmail = function (users, email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const requireLogin = (req, res, next) => {
  const userId = req.session ? req.session["user_id"] : null;
  if (!userId) {
    return res.status(403).send("You must be logged in.");
  }
  next();
};

// Middleware to check if the user is the owner of the URL
const requireOwnership = (urlDatabase) => (req, res, next) => {
  const userId = req.session ? req.session["user_id"] : null;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  // Check if the URL exists
  if (!url) {
    return res.status(404).send("URL not found");
  }

  // Check if the logged-in user is the owner of the URL
  if (url.userID !== userId) {
    return res.status(403).send("Permission denied.");
  }

  next();
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

function urlBelongsToUser(req, urlId) {
  const newUserId = req.session.user_id;
    const urlObject = urlDatabase[urlId];
    const user = users[newUserId];


  if (!user || !urlObject) {
    return false;
  }

  return urlObject.userID === newUserId;
}


module.exports = {
  findUserByEmail,
  authenticateUser,
  randomString,
  urlsForUser,
  urlBelongsToUser,
  requireLogin,
  requireOwnership
};

