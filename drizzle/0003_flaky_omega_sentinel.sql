ALTER TYPE "public"."user_status" ADD VALUE 'deleted';--> statement-breakpoint
ALTER TYPE "public"."verification_purpose" ADD VALUE 'register';--> statement-breakpoint
ALTER TYPE "public"."verification_purpose" ADD VALUE 'password_reset';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;