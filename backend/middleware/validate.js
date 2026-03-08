const Joi = require("joi");

function formatJoiMessage(error) {
  const detail = error?.details?.[0];
  return (detail?.message && detail.message.replace(/"/g, "")) || "Invalid input";
}

function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    if (body) {
      const result = body.validate(req.body, { abortEarly: true });
      if (result.error) {
        return res.status(400).json({
          success: false,
          message: formatJoiMessage(result.error),
        });
      }
      req.body = result.value;
    }

    if (query) {
      const result = query.validate(req.query, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: false,
      });
      if (result.error) {
        return res.status(400).json({
          success: false,
          message: formatJoiMessage(result.error),
        });
      }
      req.query = result.value;
    }

    if (params) {
      const result = params.validate(req.params, { abortEarly: true });
      if (result.error) {
        return res.status(400).json({
          success: false,
          message: formatJoiMessage(result.error),
        });
      }
      req.params = result.value;
    }

    next();
  };
}

module.exports = { validate, Joi };

