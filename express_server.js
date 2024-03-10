const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase 
  };
 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || null,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { id: shortURL, longURL: longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/update", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] || null, };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || null,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] || null,
  };
  res.render("login", templateVars);
});

app.get("/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Post 

app.post("/urls", (req, res) => {
  const shortURL = randomString();
  const longURL = req.body.longURL;
  
  // Save the key-value pair in the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect to the /urls/:id page for the newly created shortURL
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => { //Delete 
  const deleteURL = req.params.id
  if(urlDatabase.hasOwnProperty(deleteURL)){
  delete urlDatabase[deleteURL]
  res.redirect("/urls")
  }
})

app.post("/urls/:id/update", (req, res) => {
  const updateURL = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase.hasOwnProperty(updateURL)) {
    urlDatabase[updateURL] = newLongURL;
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/login", (req, res) => {
  // Retrieve username from the request body
  const username = req.body.username;
  // Redirect or respond based on authentication result
 
    res.cookie("username", username);
    // Successful authentication
    res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  // Clear the username cookie to log out the user
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check for empty email or password
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Check if the email is already in use
  for (const userId in users) {
    if (isEmailInUse(email, user)){
    res.status(400).send("Email already in use");
    return;
  }
  }
  

  // If email is not in use and both email and password are provided, proceed with registration
  const userId = randomString();
  const newUser = {
    id: userId,
    email,
    password,
  };

  users[userId] = newUser;

  res.cookie('user_id', userId);
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const randomString = function() { //Random alphanumeric value for url creation
  const numlets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * numlets.length);
    result += numlets.charAt(randomIndex);
  }

  return result;
};
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

const isEmailInUse = function(email, users) {
  for (const userId in users) {
    if (users.hasOwnProperty(userId)) {
      if (users[userId].email === email) {
        return true; // Return true if the email is found
      }
    }
  }
  return false; // Return false if the email is not found
};