const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");

const {randomNumberGenerator, getUserByEmail} = require('./helpers')
const {users, urlDatabase} = require('./databases');
const e = require("express");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.get("/", (req, res) => {
  res.redirect("login");
});

//GET
//Main page
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send('Log in to enter');
  }

  const user = users[userId];


  const templateVars = { urls: urlDatabase, user }; 
  res.render("urls_index", templateVars);
});;

//New URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Url Individual Page
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortenURL = req.params.id; 
  const longURL = urlDatabase[shortenURL];
  const user = users[userId];

  const templateVars ={ longURL: longURL, id: shortenURL, user }

  res.render("urls_show", templateVars)
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { req: req}
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
    res.redirect("/urls");
  }
});

//register page
app.get("/register", (req, res) => {
  const templateVars = { req: req}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
const email = req.body.email;
const password = req.body.password;

if(!email || ! password){
  res.status(400).send('Please fill in email and password');
  return;
};

const oldUser = getUserByEmail(email, users) //uses email to see if email is in database already

if(oldUser){
  res.status(400).send('email is already in use')
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
})


//create new URL
app.post("/urls", (req, res) => {
  const shortURL = randomNumberGenerator();
  const longURL = req.body.longURL

  // This stores the longURL into the urlDatabase as a value for the shortURL
  urlDatabase[shortURL] = longURL
  
  res.redirect(`/urls/`);
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  delete urlDatabase[shortURL];
  res.redirect('/urls')
})

//logout
app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect("/login");
});

//Short URL and update
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL; 
  
  urlDatabase[shortURL] = newLongURL;
  
  res.redirect(`/urls`);
});

//LISTEN

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
