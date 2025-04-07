import ErrorHandler from "../ErrorHandler";
import { SignJWT, jwtVerify } from "jose";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN;

type JwtPayload = {
  userId: string;
  email?: string;
  username?: string;
};

type TokenType = 'access' | 'refresh'

// Helper to get the secret key
const getSecretKey = (type: TokenType) => {
  const secret = type === 'access'
    ? ACCESS_TOKEN_SECRET
    : REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error(`${type.toUpperCase()}_TOKEN is not defined`);
  }

  return new TextEncoder().encode(secret);
};

// Generate JWT tokens
export async function generateTokens(
  payload: JwtPayload,
  type?: TokenType
): Promise<{ accessToken?: string; refreshToken?: string }> {
  // Helper function to sign tokens
  const signToken = async (exp: string, tokenType: TokenType): Promise<string> => {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(getSecretKey(tokenType));
  };

  // Generate both tokens if no type specified
  if (!type) {
    const accessToken = await signToken('5m', 'access');
    const refreshToken = await signToken('1d', 'refresh');
    return { accessToken, refreshToken };
  }

  // Generate specific token based on type
  if (type === 'access') {
    const accessToken = await signToken('5m', 'access');
    return { accessToken };
  } else {
    const refreshToken = await signToken('1d', 'refresh');
    return { refreshToken };
  }
}


// Verify tokens (can be used in both Edge and Node.js environments)
export async function verifyToken(token: string, type: TokenType = "access"): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(type));
    return payload as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Manages authentication tokens, creating both access and refresh tokens
 * or refreshing tokens when needed
 * @param {Object} payload - User data to encode
 * @param {string} existingRefreshToken - Optional existing refresh token
 * @returns {Object} Object containing access and refresh tokens
 */
export async function manageTokens(
  payload: JwtPayload,
  existingRefreshToken: string | null
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    if (!existingRefreshToken) {
      console.log("No existing refresh token, generating a new one");
      // const refreshToken = await generateTokens(payload, "refresh") as string;
      const { accessToken, refreshToken } = await generateTokens(payload);
      if (!accessToken || !refreshToken) {
        throw new Error("Failed to generate tokens");
      }
      return { accessToken, refreshToken };
    }
    const refreshTokenPayload = await verifyToken(existingRefreshToken, "refresh");
    if (!refreshTokenPayload || refreshTokenPayload.userId !== payload.userId) {
      console.log("Existing refresh token is invalid or expired, generating a new one");
      const { accessToken, refreshToken } = await generateTokens(payload);
      if (!accessToken || !refreshToken) {
        throw new Error("Failed to generate tokens");
      }
      return { accessToken, refreshToken };
    }
    console.log("Using existing refresh token");
    const accessToken = await generateTokens(payload, "access") as string;
    return { accessToken, refreshToken: existingRefreshToken };
  } catch (error) {
    console.error('Error in manageTokens:', error);
    const { status, message } = ErrorHandler(error);
    console.log(status, message)
    throw new Error('Token management failed');
  }
}
