import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ErrorHandler from "../ErrorHandler";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN;

type JwtPayload = {
  userId: string;
  email?: string;
  username?: string;
};

/**
 * Generates JWT tokens (access and refresh)
 * @param {Object} payload - The data to encode in the token
 * @param {string} type - Token type: 'access' or 'refresh'
 * @returns {string} The generated token
 */
export const generateToken = (payload: JwtPayload, type = "access") => {
  try {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      throw new Error("JWT secrets not configured in environment variables");
    }

    const secret =
      type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    const expiresIn = type === "access" ? "30m" : "24h";

    console.log(`Generating ${type} token....`);

    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  } catch (error) {
    const errorResponse = ErrorHandler(error);
    throw new Error(`Failed to generate ${type} token: ${errorResponse.message}`);
  }
};

/**
 * Verifies JWT token
 * @param {string} token - The token to verify
 * @param {string} type - Token type: 'access' or 'refresh'
 * @returns {Object} The decoded token payload
 */
export const verifyToken = (token: string, type = "access") => {
  try {
    if (!token) {
      throw new Error(`${type} token is required.`);
    }

    const secret =
      type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;

    if (!secret) {
      throw new Error(`${type} token secret is not configured in environment variables`);
    }

    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    // Handle JWT-specific errors first
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(`${type} token has expired`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid ${type} token`);
    }

    // For other errors, use the ErrorHandler
    const errorResponse = ErrorHandler(error);
    throw new Error(`JWT verification failed: ${errorResponse.message}`);
  }
};

/**
 * Manages authentication tokens, creating both access and refresh tokens
 * or refreshing tokens when needed
 * @param {Object} payload - User data to encode
 * @param {string} existingRefreshToken - Optional existing refresh token
 * @returns {Object} Object containing access and refresh tokens
 */
export const manageTokens = (
  payload: JwtPayload,
  existingRefreshToken: string | null = null
): { accessToken: string; refreshToken: string } => {
  try {
    // Create new access token
    const accessToken = generateToken(payload, "access");
    let refreshToken = existingRefreshToken;

    // Check if refresh token exists and is valid
    if (!existingRefreshToken) {
      // No existing token, create new one
      refreshToken = generateToken(payload, "refresh");
    } else {
      try {
        // Verify existing refresh token
        verifyToken(existingRefreshToken, "refresh");
        // Token is valid, keep using it
        console.log("Using existing refresh token");
      } catch (error) {
        // Token is invalid or expired, generate new one
        console.log("Refresh token invalid or expired, generating new one");
        const errorResponse = ErrorHandler(error);
        console.error(`Refresh token error: ${errorResponse.message}`);
        refreshToken = generateToken(payload, "refresh");
      }
    }

    return {
      accessToken,
      refreshToken: refreshToken as string
    };
  } catch (error) {
    const errorResponse = ErrorHandler(error);
    throw new Error(`Token management failed: ${errorResponse.message}`);
  }
};
