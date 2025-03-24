export const paths = {
  auth: {
    signIn: {
      path: "/signin",
    },
    signUp: {
      path: "/signup",
    },
    signOut: {
      path: "/signout",
    },
    refresh: {
      path: "/renew-token",
    },
    forgotPassword: {
      path: "/forgot-password",
    },
    resetPassword: {
      path: "/reset-password",
    },
    verifyEmail: {
      path: "/verify-email",
    },
    verifyOAuthCode: {
      path: "/verify-code",
    },
    googleOAuth: {
      path: "/google",
    },
    facebookOAuth: {
      path: "/facebook",
    },
  },
  user: {
    me: {
      path: "/me",
    },
    preferences: {
      path: "/preferences",
    },
    profile: {
      path: "/profile",
    },
  },
  chat: {
    history: {
      path: "/chat/history",
    },
    list: {
      path: "/chat/list",
    },
    suggestions: {
      path: "/chat/suggestions",
    },
  },
  upload: {
    presignedUrl: {
      path: "/presigned-url",
    },
  },
} as const;
