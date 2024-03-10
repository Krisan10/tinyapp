const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

const { findUserByEmail, authenticateUser, randomString} = require("./functions")

const saltRounds = 10;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// GET
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

  // Check if the user is logged in
  if (!userId) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user_id: userId,
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // Check if the user is not logged in
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user_id: req.cookies["user_id"] || null,
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
      user_id: req.cookies["user_id"] || null,
      errorMessage: "URL not found",
    };
    res.status(404).render("error", templateVars);
  }
});

app.get("/urls/:id/update", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"] || null, };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  // Check if the user is already logged in
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user_id: req.cookies["user_id"] || null,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  // Check if the user is already logged in
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user_id: req.cookies["user_id"] || null,
  };
  res.render("register", templateVars);
});

//Post

app.post("/urls", (req, res) => {
  // Check if the user is not logged in
  if (!req.cookies["user_id"]) {
    res.status(403).send("You must be logged in to shorten URLs.");
    return;
  }

  const shortURL = randomString();
  const longURL = req.body.longURL;

  // Add the URL to the database only if the user is logged in
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id;

  // Check if the URL with the specified ID exists in the urlDatabase
  if (urlDatabase[deleteURL] !== undefined) {
    delete urlDatabase[deleteURL];
    res.redirect("/urls");
  } else {

    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/update", (req, res) => {
  const updateURL = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[updateURL] !== undefined) {
    urlDatabase[updateURL] = newLongURL;
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = authenticateUser(email, password);

  if (!user) {
    res.status(403).send("Invalid email or password");
    return;
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Register handler
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (findUserByEmail(users, email)) {
    console.log("Email already registered");
    res.status(400).send("Email already registered");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const newUser = {
    id: email,
    email: email,
    password: hashedPassword,
  };

  users[email] = newUser;
  console.log("User registered successfully");
  res.cookie("user_id", email);
  res.redirect("/urls");
})

// Logout handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

