CREATE TABLE "ocr_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" uuid,
	"raw_image_path" text NOT NULL,
	"extracted_data" jsonb,
	"confidence" numeric(5, 4),
	"model_version" text DEFAULT 'v1.0',
	"human_verified" boolean DEFAULT false,
	"corrected_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ocr_receipts" ADD CONSTRAINT "ocr_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_receipts" ADD CONSTRAINT "ocr_receipts_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ocr_user_id_idx" ON "ocr_receipts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ocr_verified_idx" ON "ocr_receipts" USING btree ("human_verified");--> statement-breakpoint
CREATE INDEX "bills_user_id_idx" ON "fixed_costs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goals_status_idx" ON "goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tx_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tx_date_idx" ON "transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "tx_category_id_idx" ON "transactions" USING btree ("category_id");