function formatZodError(error) {
  return error.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
}

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatZodError(result.error),
      });
    }
    if (source === 'query') req.query = result.data;
    else if (source === 'params') req.params = result.data;
    else req.body = result.data;
    next();
  };
}

module.exports = validate;
