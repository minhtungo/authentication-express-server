import { chatMessagesRelations } from "@/db/schemas/chatMessages";

export * from "./accounts";
export * from "./resetPasswordTokens";
export * from "./twoFactorConfirmations";
export * from "./twoFactorTokens";
export * from "./users";
export * from "./userSettings";
export * from "./verificationTokens";
export * from "./sessions";
export * from "./chats";
export * from "./chatMessages";
export * from "./fileUploads";
export * from "./messageAttachments";
export * from "./subscription";

export const relations = {
  chatMessages: chatMessagesRelations,
};
