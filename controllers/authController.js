const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

//Login requests
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "HomeHive | Login",
    isLoggedIn: false,
    oldInput: { email: "", password: "" },
    errorMessage: [],
    user: {},
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOneByEmail(email); // Fixed method name
    
    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "HomeHive | Login",
        isLoggedIn: false,
        errorMessage: ["User does not exist"],
        oldInput: { email },
        user: {},
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "HomeHive | Login",
        isLoggedIn: false,
        errorMessage: ["Invalid password"],
        oldInput: { email },
        user: {},
      });
    }
    
    req.session.isLoggedIn = true;
    req.session.user = user;
    
    // Use promise-based session save
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return next(err);
      }
      req.flash("success", "Login successful!");
      res.redirect("/");
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("auth/login", {
      pageTitle: "HomeHive | Login",
      isLoggedIn: false,
      errorMessage: ["An error occurred. Please try again."],
      oldInput: { email: req.body.email || "" },
      user: {},
    });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/login");
  });
};

//Sign Up requests
exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "HomeHive | Signup", // Fixed case consistency
    isLoggedIn: false,
    errorMessage: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
    },
    user: {},
  });
};

exports.postSignUp = [
  // First Name validation
  check("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters"),

  // Last Name validation
  check("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters"),

  // Email validation
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail()
    .custom(async (value) => {
      try {
        const existingUser = await User.findOneByEmail(value);
        if (existingUser) {
          throw new Error("User already exists with this email");
        }
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    }),

  // Password validation
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .trim(),

  // Confirm password validation
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match"); // Fixed grammar
      }
      return true;
    }),

  // User Type validation
  check("userType")
    .notEmpty()
    .withMessage("User type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  // Terms Accepted validation
  check("terms&cond").custom((value) => {
    if (value !== "on") {
      throw new Error("You must accept the terms and conditions");
    }
    return true;
  }),

  // Handle the request after validation
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, userType } = req.body;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const errorArray = errors.array();
        return res.status(422).render("auth/signup", {
          pageTitle: "HomeHive | Signup",
          isLoggedIn: false,
          errorMessage: errorArray.map((err) => err.msg),
          oldInput: {
            firstName,
            lastName,
            email,
            userType,
          },
          user: {},
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create new user
      const user = new User(
        firstName,
        lastName,
        email,
        hashedPassword,
        userType
      );

      // Save user to database
      await user.save();
      
      req.flash("success", "Registration successful. You can log in now.");
      res.redirect("/login");
      
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle duplicate email error specifically
      let errorMessage = "An error occurred during registration. Please try again.";
      if (error.message.includes("email")) {
        errorMessage = error.message;
      }
      
      return res.status(422).render("auth/signup", {
        pageTitle: "HomeHive | Signup",
        isLoggedIn: false,
        errorMessage: [errorMessage],
        oldInput: {
          firstName: req.body.firstName || "",
          lastName: req.body.lastName || "",
          email: req.body.email || "",
          userType: req.body.userType || "",
        },
        user: {},
      });
    }
  },
];