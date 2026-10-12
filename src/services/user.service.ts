import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/jwt.ts";
import prisma from "../prismaClient.ts";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// function to register a new user
export async function registerUser(
  email: string,
  password: string,
  name?: string,
) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return await prisma.userAccount.create({
    data: { email, password: hashedPassword, name },
  });
}

// function to login
export async function loginUser(email: string, password: string) {
  const user = await prisma.userAccount.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (!user.password) {
    throw new Error("This account uses Google sign-in. Please continue with Google.");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid password");
  const token = generateToken(user.id);

  return { token, user };
}

// verify a Google ID token and find / create / link the matching user
export async function googleAuthenticate(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google credential");
  }

  // never trust an unverified email for account linking (anti pre-hijacking)
  if (!payload.email_verified) {
    throw new Error("Google account email is not verified");
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const picture = payload.picture;

  // 1. returning Google user
  let user = await prisma.userAccount.findUnique({ where: { googleId } });

  if (!user) {
    // 2. existing email/password account -> link the Google identity
    const existingByEmail = await prisma.userAccount.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      user = await prisma.userAccount.update({
        where: { id: existingByEmail.id },
        data: {
          googleId,
          picture,
          name: existingByEmail.name ?? name,
          authSource: "both",
        },
      });
    } else {
      // 3. brand new Google user
      user = await prisma.userAccount.create({
        data: { googleId, email, name, picture, authSource: "google" },
      });
    }
  } else {
    // refresh profile info from Google
    user = await prisma.userAccount.update({
      where: { id: user.id },
      data: { name, picture, email },
    });
  }

  const token = generateToken(user.id);

  return { token, user };
}

// update user name
export async function updateUserName(userId: number, name: string) {
  return await prisma.userAccount.update({
    where: { id: userId },
    data: { name },
  });
}

// update user gender (used to style the avatar)
export async function updateUserGender(userId: number, gender: string | null) {
  return await prisma.userAccount.update({
    where: { id: userId },
    data: { gender },
  });
}

// update the chosen avatar variant
export async function updateUserAvatar(userId: number, avatarId: number) {
  return await prisma.userAccount.update({
    where: { id: userId },
    data: { avatarId },
  });
}

// change password
export async function updateUserPassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
) {
  const user = await prisma.userAccount.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // verify old password (accounts created via Google have none yet)
  if (user.password) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  return await prisma.userAccount.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
}

// update user email
export async function updateUserEmail(userId: number, email: string) {
  const existing = await prisma.userAccount.findUnique({ where: { email } });

  if (existing && existing.id !== userId) {
    throw new Error("Email already in use");
  }

  return await prisma.userAccount.update({
    where: { id: userId },
    data: { email },
  });
}

// delete user account
export async function deleteUserAccount(userId: number) {
  return await prisma.userAccount.delete({ where: { id: userId } });
}
