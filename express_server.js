const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const PORT = 8080; // default port 8080

const { findUserByEmail, authenticateUser, randomString, urlsForUser, urlBelongsToUser, requireLogin, requireOwnership} = require("./helpers")

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'secretCookie',

  // 24 hours
  maxAge: 24 * 60 * 60 * 1000 
}));

const users = {};

const urlDatabase = {};



// GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];

  // Check if the user is logged in
  if (!userId) {
    const templateVars = {
      user_id: null,
      errorMessage: "You must be logged in to view your URLs.",
    };
    res.status(403).render("error", templateVars);
    return;
  }

  const templateVars = {
    user_id: users.email,
    urls: urlDatabase, // Pass the entire urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // Check if the user is not logged in
  if (!req.session["user_id"]) {
    res.redirect("/login");
    return;
  }

  const userId = req.session["user_id"];
  const userURLs = urlsForUser(userId, urlDatabase);  // Corrected call

  const templateVars = {
    user_id: userId || null,
    urls: userURLs,
  };

  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    const templateVars = {
      user_id: req.session["user_id"] || null,
      errorMessage: "URL not found",
      id: shortURL, 
    };
    res.status(404).render("error", templateVars);
  }
});

app.get("/urls/:id/update", requireLogin, requireOwnership(urlDatabase), (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session["user_id"];
  const url = urlDatabase[shortURL];

  const templateVars = {
    shortURL: shortURL,
    longURL: url.longURL,
    user_id: userId,
  };

  res.render("urls_show", templateVars);
});


app.get("/login", (req, res) => {
  const newUserId = req.session.user_id;
  const user = users[newUserId];
  const templateVars = {
    user_id: req.session.user_id,  
    urls: urlDatabase,
    currentUser: user,
  };

  // Check if user object was found
  if (authenticateUser(user)) {
    return res.redirect('/urls');
  }

  return res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  //Extract user information from cookies
  const newUserId = req.session.user_id;
  const user = users[newUserId];

  if (authenticateUser(user)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    userId: req.session.user_id,
    urls: urlDatabase,
    currentUser: user,
  };
  return res.render("register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const {longURL} = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

//Post

app.post("/urls", (req, res) => {
  // Check if the user is not logged in
  if (!req.session["user_id"]) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }

  const shortURL = randomString();
  const longURL = req.body.longURL;

  // Update the URL data structure
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session["user_id"],
  };

  res.redirect(`/urls`);
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session["user_id"];

  // Check if the user is logged in
  if (!userId) {
    return res.status(403).send("You must be logged in to delete URLs.");
  }

  const url = urlDatabase[shortURL];

  // Check if the URL exists
  if (!url) {
    return res.status(404).send("URL not found");
  }

  // Check if the logged-in user is the owner of the URL
  if (urlBelongsToUser(userID)) {
    return res.status(403).send("Unable to delete this URL without proper permission.");
  }

  // Delete the URL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session["user_id"];
  const newLongURL = req.body.newLongURL;

  // Check if the user is logged in
  if (!userId) {
    return res.status(403).send("You must be logged in to edit URLs.");
  }

  const url = urlDatabase[shortURL];

  // Check if the URL exists
  if (!url) {
    return res.status(404).send("URL not found");
  }

  // Check if the logged-in user is the owner of the URL
  if (url.userID !== userId) {
    return res.status(403).send("Permission denied to edit this URL.");
  }

  // Update the URL with the new longURL
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls`);
});

// Login Handler
app.post("/login", (req, res) => {

  const { email, password } = req.body;
  const user = findUserByEmail(users, email);

  //Check if the user or hashed user password exists
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid password or email");
  }

  // Set cookie only if the user exists
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Register handler
app.post("/register", (req, res) => {
  
  //Extract email and password from the form
  const { email, password } = req.body;
  const id = "user_" + randomString();

  if (!email || !password) {
    return res.status(400).send("Please enter a valid email and password");
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (findUserByEmail(users, email)) {
    return res.status(400).send("This email is already registered");
  }
  //Add the new user
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  // Set cookie and redirect
  req.session.user_id = id;
  return res.redirect("/urls");
});

// Logout handler
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

