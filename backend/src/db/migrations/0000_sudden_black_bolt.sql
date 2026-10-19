DO $$ BEGIN
 CREATE TYPE "public"."transaction_detail_status" AS ENUM('BORROWED', 'RETURNED', 'OVERDUE', 'BROKEN', 'LOST');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."category" AS ENUM('FIXED WING', 'ROTARY WING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tool_unit_status" AS ENUM('READY', 'BORROWED', 'INSPECTION', 'MAINTANANCE', 'SCRAPPED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."transaction_type" AS ENUM('BORROW', 'RETURN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('SUPER ADMIN', 'ADMIN', 'QUALITY CONTROL', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"auditor_id" uuid NOT NULL,
	"sample_qty" integer NOT NULL,
	"notes" text,
	"auditDate" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_items" (
	"audit_items" bigserial PRIMARY KEY NOT NULL,
	"audit_id" bigint NOT NULL,
	"tool_type_id" integer NOT NULL,
	"audit_status" varchar(20) NOT NULL,
	"tool_qty" integer NOT NULL,
	"tool_notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" "category" NOT NULL,
	CONSTRAINT "programs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_number" varchar(30) NOT NULL,
	"name" varchar(100) NOT NULL,
	"program_id" integer NOT NULL,
	"description" varchar(255),
	"qcPeriode" integer,
	"location" varchar(100) NOT NULL,
	CONSTRAINT "tool_type_tool_number_unique" UNIQUE("tool_number"),
	CONSTRAINT "tool_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_type_id" integer NOT NULL,
	"seq_no" varchar(5) NOT NULL,
	"status" "tool_unit_status" DEFAULT 'READY' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "borrow" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"program_id" integer NOT NULL,
	"approver_id" uuid,
	"type" "transaction_type" DEFAULT 'BORROW' NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"reference_type" varchar(30),
	"jid_no" varchar(30),
	"work_center_id" bigint,
	"work_area_id" bigint,
	"total_requested_items" integer DEFAULT 0 NOT NULL,
	"total_units" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"checkout_date" timestamp,
	"expected_return_date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_detail" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transaction_id" bigint NOT NULL,
	"transaction_item_id" bigint,
	"tool_id" integer NOT NULL,
	"status" "transaction_detail_status" DEFAULT 'BORROWED' NOT NULL,
	"returned_at" timestamp,
	"return_notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_item" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transaction_id" bigint NOT NULL,
	"tool_type_id" integer NOT NULL,
	"requested_qty" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_center_id" bigint NOT NULL,
	"work_area_id" bigint NOT NULL,
	"employee_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password_hash" varchar(255),
	"role" "role" DEFAULT 'USER' NOT NULL,
	"department" varchar(100) NOT NULL,
	"status" "status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work_centers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"org_code" varchar(10) NOT NULL,
	CONSTRAINT "work_centers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit" ADD CONSTRAINT "audit_auditor_id_user_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_items" ADD CONSTRAINT "audit_items_audit_id_audit_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audit"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_items" ADD CONSTRAINT "audit_items_tool_type_id_tool_type_id_fk" FOREIGN KEY ("tool_type_id") REFERENCES "public"."tool_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool_type" ADD CONSTRAINT "tool_type_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tool" ADD CONSTRAINT "tool_tool_type_id_tool_type_id_fk" FOREIGN KEY ("tool_type_id") REFERENCES "public"."tool_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "borrow" ADD CONSTRAINT "borrow_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "borrow" ADD CONSTRAINT "borrow_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "borrow" ADD CONSTRAINT "borrow_approver_id_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "borrow" ADD CONSTRAINT "borrow_work_center_id_work_centers_id_fk" FOREIGN KEY ("work_center_id") REFERENCES "public"."work_centers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "borrow" ADD CONSTRAINT "borrow_work_area_id_work_areas_id_fk" FOREIGN KEY ("work_area_id") REFERENCES "public"."work_areas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_detail" ADD CONSTRAINT "transaction_detail_transaction_id_borrow_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."borrow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_detail" ADD CONSTRAINT "transaction_detail_transaction_item_id_transaction_item_id_fk" FOREIGN KEY ("transaction_item_id") REFERENCES "public"."transaction_item"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_detail" ADD CONSTRAINT "transaction_detail_tool_id_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tool"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_transaction_id_borrow_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."borrow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_item" ADD CONSTRAINT "transaction_item_tool_type_id_tool_type_id_fk" FOREIGN KEY ("tool_type_id") REFERENCES "public"."tool_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_work_center_id_work_centers_id_fk" FOREIGN KEY ("work_center_id") REFERENCES "public"."work_centers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_work_area_id_work_areas_id_fk" FOREIGN KEY ("work_area_id") REFERENCES "public"."work_areas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_single_super_admin" ON "user" USING btree ("role") WHERE "user"."role" = 'SUPER ADMIN';