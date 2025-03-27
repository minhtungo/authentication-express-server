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
    conversations: {
      path: "/conversations",
    },
    conversation: {
      path: "/conversation",
      getHref: (conversationId: string) => `/chat/conversation/${conversationId}`,
    },
  },
  upload: {
    presignedUrl: {
      path: "/presigned-url",
    },
    confirm: {
      path: "/confirm",
    },
    userUploads: {
      path: "/user-uploads",
    },
  },
} as const;
