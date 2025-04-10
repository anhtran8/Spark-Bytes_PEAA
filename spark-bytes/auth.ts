import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "./lib/supabase";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if the user already exists in the database
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("email, dietary_preferences")
          .eq("email", user.email)
          .single();

        // For new users, Supabase will return a "not found" error
        // We should continue with the sign-in process in this case
        let dietaryPreferences = [];
        
        // If user exists, use their preferences
        if (existingUser) {
          dietaryPreferences = existingUser.dietary_preferences || [];
        }

        // Upsert the user (update if exists, insert if new)
        const { error: upsertError } = await supabase
          .from("users")
          .upsert(
            [
              {
                email: user.email,
                name: user.name,
                dietary_preferences: dietaryPreferences,
              },
            ],
            {
              onConflict: "email",
            }
          );

        if (upsertError) {
          console.error("Error upserting user:", upsertError);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Unexpected error during sign-in:", error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});