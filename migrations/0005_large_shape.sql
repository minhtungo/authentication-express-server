CREATE TABLE "messageAttachments" (
	"id" text PRIMARY KEY NOT NULL,
	"messageId" text NOT NULL,
	"fileUploadId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messageAttachments" ADD CONSTRAINT "messageAttachments_messageId_chatMessages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."chatMessages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messageAttachments" ADD CONSTRAINT "messageAttachments_fileUploadId_fileUploads_id_fk" FOREIGN KEY ("fileUploadId") REFERENCES "public"."fileUploads"("id") ON DELETE cascade ON UPDATE no action;