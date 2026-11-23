function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return res.status(409).json({
      success: false,
      message: `A record with this unique field already exists${target}.`,
      error: 'Conflict'
    });
  }

  // Prisma foreign key constraint violation (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Referential integrity violation: Referenced foreign key does not exist.',
      error: 'Foreign Key Constraint Failed'
    });
  }

  // Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested record was not found in the database.',
      error: 'Not Found'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
