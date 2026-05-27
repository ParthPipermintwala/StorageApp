import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new Error("Google ID token is required");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    throw new Error("Google email not verified");
  }

  return {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    googleId: payload.sub,
  };
};