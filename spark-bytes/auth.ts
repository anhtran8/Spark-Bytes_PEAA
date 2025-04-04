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
      // Check if the user already exists in the database
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("email, dietary_preferences")
        .eq("email", user.email)
        .single();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return false;
      }

      // If the user exists, keep their existing dietary_preferences
      const dietaryPreferences = existingUser?.dietary_preferences || [];

      // Upsert the user with their existing dietary_preferences
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
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});