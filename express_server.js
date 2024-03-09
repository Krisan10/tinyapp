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
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/update", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
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

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() { //Random alphanumeric value for url creation
  const numlets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * numlets.length);
    result += numlets.charAt(randomIndex);
  }

  return result;
};
