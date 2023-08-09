var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");



const public_router = require("./routes/public");
const private_router = require("./routes/private");

const { StatusCodes } = require("http-status-codes");
const { initPassport } = require("./passportconfig.js");

const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const fileUpload = require("express-fileupload");

var app = express();
initPassport(passport);
connectMongoose();

app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(fileUpload());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1200000, // 2 minutes
      // expires: new Date(Date.now() + 120000) // 2 minutes from now
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/public/", public_router());
app.use("/api/private/", private_router());

app.use(express.static(path.join(__dirname, process.env.BUILD_PATH)));

app.use("/login", express.static(path.join(__dirname, process.env.BUILD_PATH)));



app.get("/dash", (req, res) => {
  res.sendFile(
    path.resolve(
      "../public/index.html"
    )
  );
});

app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {}),
  function (req, res) {}
);

app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/dash");
  }
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dash");
  }
);

app.post(
  "/login",
  passport.authenticate("local", { failWithError: "not found" }),
  async (req, res) => {
    res.status(StatusCodes.OK).json({ success: "ok", message: "logged in" });
  }
);

var listener = app.listen(8080, function () {
  console.clear();
  console.log("Listening on port " + listener.address().port);
});
