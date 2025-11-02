const { body } = require("express-validator");
const validatePassword = require("../../utils/passwordValidator");

exports.register = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Phone number is invalid"),
  body("password")
    .custom((value) => {
      const result = validatePassword(value);
      if (!result.isValid) {
        throw new Error(result.errors.join(". "));
      }
      return true;
    }),
  body("role")
    .optional()
    .isIn(["mentor", "mentee"])
    .withMessage("Role must be either mentor or mentee"),
];

exports.login = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];
