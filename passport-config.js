const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;

const newUser = require("./schema/user");

exports.initPassport = (passport) => {
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, { id: user.id, user: user });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (!username || !password) {
          // res.status(StatusCodes.BAD_REQUEST).json({"message":"Invalid form data"})
          return done(null, false);
        } else {
          const user_det = await newUser.findOne({ email: username });
          if (!user_det) {
            return done(null, false);
          } else {
            const isPasswordCorrect = await user_det.comparePassword(password);

            if (!isPasswordCorrect) {
              return done(null, false);
            } else {
              const token = await user_det.createJWT();
              user_det.set("provider", "local", { strict: false });
              user_det.set("Token", token, { strict: false });
              return done(null, user_det);
            }
          }
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://j46xf7-8080.csb.app/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        user_var = profile;
        return cb(null, user_var);
      }
    )
  );

  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICRO_SOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: "http://localhost:4200/auth/microsoft/callback",
        scope: ["user.read"],
      },
      function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    )
  );
};
