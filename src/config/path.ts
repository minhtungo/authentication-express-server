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
      callback: {
        path: "/google/callback",
      },
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
    room: {
      path: "/room",
    },
    rooms: {
      path: "/rooms",
    },
    message: {
      path: "/message",
    },
    messages: {
      path: "/messages/:chatId",
    },
  },
  upload: {
    presignedUrl: {
      path: "/presigned-url",
    },
  },
} as const;
