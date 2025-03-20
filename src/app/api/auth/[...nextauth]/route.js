import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				await connectDB();

				const user = await User.findOne({ email: credentials.email });

				if (!user) {
					throw new Error("No user found with this email");
				}

				const isPasswordMatch = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (!isPasswordMatch) {
					throw new Error("Invalid credentials");
				}

				return {
					id: user._id.toString(),
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
	pages: {
		signIn: "/login",
		signUp: "/register",
		error: "/auth/error",
	},
	callbacks: {
		async signIn({ user, account }) {
			// Only proceed for Google accounts
			if (account.provider === "google") {
				try {
					await connectDB();

					// Check if user already exists
					const existingUser = await User.findOne({ email: user.email });

					if (!existingUser) {
						// Create a new user with Google data
						const newUser = new User({
							name: user.name,
							email: user.email,
							// For Google users, we don't need a password
							// Generate a secure random password they won't need to use
							password: await bcrypt.hash(
								Math.random().toString(36).slice(-8) + Date.now().toString(),
								10
							),
							role: "user", // Default role for Google users
							image: user.image,
						});

						await newUser.save();

						// Update the user object with database ID and role
						const dbUser = await User.findOne({ email: user.email });
						if (dbUser) {
							user.id = dbUser._id.toString();
							user.role = dbUser.role;
						}
					} else {
						// Update the user object with existing user data
						user.id = existingUser._id.toString();
						user.role = existingUser.role;
					}
				} catch (error) {
					console.error("Error saving Google user:", error);
					return false;
				}
			}
			return true;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.role = token.role;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXT_AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
