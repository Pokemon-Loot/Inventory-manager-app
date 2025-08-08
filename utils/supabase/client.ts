import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Override the signup method to disable email confirmation
  const originalSignUp = client.auth.signUp.bind(client.auth)

  client.auth.signUp = async (credentials) => {
    const result = await originalSignUp({
      ...credentials,
      options: {
        ...credentials.options,
        emailRedirectTo: undefined, // Disable email redirect
        data: {
          ...credentials.options?.data,
          skip_confirmation: true,
        },
      },
    })

    // If signup successful, immediately try to sign in
    if (result.data.user && !result.error) {
      // Auto sign-in after signup
      await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })
    }

    return result
  }

  return client
}
