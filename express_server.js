const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const bcrypt = require("bcryptjs");

const {randomNumberGenerator, getUserByEmail, urlsForUser} = require('./helpers');
const {users, urlDatabase} = require('./databases');

app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

//Main page
//create new URL
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("You do not have permission to access this page.");
  }

  const user = users[userId];
  const userUrls = urlsForUser(userId, urlDatabase); // Get URLs specific to the user

  const templateVars = { urls: userUrls, user, userID:userId };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  //check if user is logged in
  if (!userId) {
    return res.status(401).send('You must be logged in to access this page.');
  }

  const shortURL = randomNumberGenerator();
  const longURL = req.body.longURL;

  // Store the longURL and userID in the urlDatabase
  urlDatabase[shortURL] = { longURL, userID: userId };
  
  res.redirect(`/urls`);
});


//New URL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  // Check if user is logged in
  if (!userId) {
    return res.status(302).redirect('/login');
  }
  const user = users[userId]; // Fetch user information based on userId
  const templateVars = { user: user }; // Pass user information to the view
  res.render("urls_new", templateVars);
});

//Url Individual Page
app.get("/urls/:id", (req, res) => {
  const shortenURL = req.params.id;
  const urlData = urlDatabase[shortenURL];
  
  if (!urlData) {
    return res.status(404).send('URL not found');
  }

  const userId = req.session.user_id;
  const user = users[userId];

  // Check if user is logged in and is the owner of the URL
  if (!userId || urlData.userID !== userId) {
    return res.status(403).send('Unauthorized access');
  }

  const templateVars = { longURL: urlData.longURL, id: shortenURL, user, userID: userId };
  res.render("urls_show", templateVars);
});

// Redirect short URL to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlData = urlDatabase[shortURL];

  if (!urlData) {
    return res.status(404).send('URL not found');
  }

  const longURL = urlData.longURL;
  res.redirect(longURL);
});

//login page
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    return res.redirect("/urls");
  }

  const templateVars = { req: req};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const loggedPassword = req.body.password;

  const oldUser = getUserByEmail(email, users);
  if (!oldUser || !bcrypt.compareSync(loggedPassword, oldUser.password)) {
    // Clear session data on failed login attempt
    req.session.user_id = null;
    res.status(403).send("Username and/or password does not match");
  } else {
    req.session.user_id = oldUser.id;
    const user = { email: oldUser.email }; // Ensure that user object includes email
    res.redirect("/urls");
  }
});

//register page
app.get("/register", (req, res) => {
  const templateVars = { req: req};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || ! password) {
    res.status(400).send('Please fill in email and password');
    return;
  }

  const oldUser = getUserByEmail(email, users); //uses email to see if email is in database already

  if (oldUser) {
    res.status(400).send('email is already in use');
    return;
  }

  const userID = randomNumberGenerator();
  const hashedpassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email,
    password: hashedpassword
  };

  req.session.user_id = userID;

  res.redirect("/login");
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;

  // Check if URL exists and if the logged-in user is the owner
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send('Unauthorized access');
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//logout
app.get("/logout", (req, res) => {
  req.session = null; // Clear session
  res.clearCookie('session'); // Clear session cookie
  res.redirect('/login'); // Redirect to login page
});

//Short URL and update
app.post("/urls/:id", (req, res) => {
  const shortenURL = req.params.id;
  const urlData = urlDatabase[shortenURL];
  
  if (!urlData) {
    return res.status(404).send('URL not found');
  }

  const userId = req.session.user_id;
  
  // Check if the logged-in user is the owner of the URL
  if (urlData.userID !== userId) {
    return res.status(403).send('Unauthorized access');
  }

  const newLongURL = req.body.longURL; // Corrected variable name

  // Update the long URL associated with the short URL in the database
  urlDatabase[shortenURL].longURL = newLongURL;
  
  // Pass the user information to the header partial
  const user = users[userId];
  const templateVars = { user, userID: userId };

  // Render the header and then redirect to the URLs page
  res.render("header", templateVars, (err, headerHTML) => {
    if (err) {
      // Handle error
    }
    // Redirect to the URLs page
    res.redirect(`/urls`);
  });
});

//LISTEN

app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
module.exports = app;
