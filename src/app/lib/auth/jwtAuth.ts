import ErrorHandler from "../ErrorHandler";
import { SignJWT, jwtVerify } from "jose";

type JwtPayload = {
  userId: string;
  email?: string;
  username?: string;
};

type TokenType = 'access' | 'refresh'

// Helper to get the secret key
const getSecretKey = (type: TokenType) => {
  const secret = type === 'access'
    ? process.env.ACCESS_TOKEN
    : process.env.REFRESH_TOKEN;

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
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.log(`Token expired: ${type} token`);
    } else {
      console.error('Token verification failed:', error);
    }
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
    // Check if there isn't an existing refresh token
    if (!existingRefreshToken) {
      console.log("No existing refresh token, generating a new one");
      // Generate access and refresh tokens if no refresh token. 
      const { accessToken, refreshToken } = await generateTokens(payload);
      if (!accessToken || !refreshToken) {
        throw new Error("Failed to generate tokens");
      }
      return { accessToken, refreshToken };
    }
    // If refresh token exists, verify refresh token and create access token with payload
    const refreshTokenPayload = await verifyToken(existingRefreshToken, "refresh");

    // If payload verification fails or payload does not match, recreate tokens
    if (!refreshTokenPayload || refreshTokenPayload.userId !== payload.userId) {
      console.log("Existing refresh token is invalid/expired, generating a new one");
      const { accessToken, refreshToken } = await generateTokens(payload);
      if (!accessToken || !refreshToken) {
        throw new Error("Failed to generate tokens");
      }
      return { accessToken, refreshToken };
    }

    // If payload is verified and matches, refresh tokens.
    console.log("Refreshing tokens.");
    const { accessToken, refreshToken } = await generateTokens(refreshTokenPayload);
    if (!accessToken || !refreshToken) {
      throw new Error("Failed to generate tokens.")
    }
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error in manageTokens:', error);
    const { status, message } = ErrorHandler(error);
    console.log(status, message)
    throw new Error('Token management failed');
  }
}
