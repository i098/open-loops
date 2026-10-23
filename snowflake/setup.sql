-- Open Loops: one-shot Snowflake setup. Paste into a Snowsight SQL worksheet and Run All.
-- Docs: https://docs.snowflake.com/en/sql-reference/sql/create-table
--       https://docs.snowflake.com/en/user-guide/programmatic-access-tokens
USE ROLE ACCOUNTADMIN;
CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH WAREHOUSE_SIZE = XSMALL AUTO_SUSPEND = 60 AUTO_RESUME = TRUE;
CREATE DATABASE IF NOT EXISTS OPEN_LOOPS;
USE SCHEMA OPEN_LOOPS.PUBLIC;

-- Evidence the app reads (one row per cited record).
CREATE OR REPLACE TABLE LOOP_EVIDENCE (
  LOOP_ID STRING, KIND STRING, TITLE STRING, OWNER STRING, COUNTERPART STRING,
  SOURCE_SYSTEM STRING, STATUS STRING, CREATED_AT TIMESTAMP_TZ,
  EVIDENCE_ID STRING, EVIDENCE_AT TIMESTAMP_TZ, EVIDENCE_TEXT STRING
);
INSERT INTO LOOP_EVIDENCE (LOOP_ID, KIND, TITLE, OWNER, COUNTERPART, SOURCE_SYSTEM, STATUS, CREATED_AT, EVIDENCE_ID, EVIDENCE_AT, EVIDENCE_TEXT) VALUES
  ('REQ-184', 'Stale request', 'Replacement laptop for Maya Chen', 'Alex Rivera', 'Maya Chen · IT Operations', 'Jira Service Management', 'Awaiting approval', '2026-07-23T16:02:00Z', 'REQ-184#c3', '2026-08-08T09:14:00Z', 'The laptop arrived under REQ-221. This request is a duplicate; we don''t need another.'),
  ('REQ-184', 'Stale request', 'Replacement laptop for Maya Chen', 'Alex Rivera', 'Maya Chen · IT Operations', 'Jira Service Management', 'Awaiting approval', '2026-07-23T16:02:00Z', 'REQ-221#status', '2026-08-06T17:40:00Z', 'REQ-221 status: Fulfilled. Asset MBP-14-0937 delivered to Maya Chen.'),
  ('APR-42', 'Pending approval', 'Q4 launch handoff brief', 'Alex Rivera', 'Noah Patel · Product Operations', 'Workday approvals', 'Waiting on approver', '2026-10-19T15:20:00Z', 'APR-42#request', '2026-10-19T15:20:00Z', 'Final copy and dates are ready. Please confirm the handoff brief or flag the change you need.'),
  ('APR-42', 'Pending approval', 'Q4 launch handoff brief', 'Alex Rivera', 'Noah Patel · Product Operations', 'Workday approvals', 'Waiting on approver', '2026-10-19T15:20:00Z', 'APR-42#history', '2026-10-21T11:05:00Z', 'Approval history: Legal ready, Brand ready, Support ready. Remaining approver: Alex Rivera.'),
  ('THREAD-17', 'Unanswered follow-up', 'Leo asked for a migration timeline', 'Alex Rivera', 'Leo Park · Customer Success', 'Slack #acme-migration', 'No reply', '2026-10-17T18:31:00Z', 'THREAD-17#m1', '2026-10-17T18:31:00Z', 'Acme is asking when the data migration lands. Can you give me a date I can share with them by Friday?'),
  ('THREAD-17', 'Unanswered follow-up', 'Leo asked for a migration timeline', 'Alex Rivera', 'Leo Park · Customer Success', 'Slack #acme-migration', 'No reply', '2026-10-17T18:31:00Z', 'MIG-9#plan', '2026-10-20T08:00:00Z', 'MIG-9 plan: schema cutover scheduled for Nov 4; backfill verification still unassigned.'),
  ('INV-3307', 'Overdue invoice', 'Northwind Data invoice is past due', 'Alex Rivera', 'Priya Shah · Finance AP', 'NetSuite', 'On hold', '2026-08-29T10:00:00Z', 'INV-3307#hold', '2026-09-30T13:22:00Z', 'Invoice held: PO 7781 needs budget-owner confirmation from Alex Rivera before payment.'),
  ('INV-3307', 'Overdue invoice', 'Northwind Data invoice is past due', 'Alex Rivera', 'Priya Shah · Finance AP', 'NetSuite', 'On hold', '2026-08-29T10:00:00Z', 'VENDOR-NW#email', '2026-10-20T16:45:00Z', 'Northwind: invoice 3307 for $18,400 is now 25 days past due. A late fee applies after Oct 31.'),
  ('ACC-88', 'Access review', 'Contractor still has warehouse access', 'Alex Rivera', 'Sam Ortiz · Security', 'Okta access reviews', 'Review overdue', '2026-09-12T12:00:00Z', 'ACC-88#review', '2026-09-12T12:00:00Z', 'Quarterly review: contractor j.wu still holds ANALYST_RW on PROD_WH. Contract ended Aug 31.'),
  ('ACC-88', 'Access review', 'Contractor still has warehouse access', 'Alex Rivera', 'Sam Ortiz · Security', 'Okta access reviews', 'Review overdue', '2026-09-12T12:00:00Z', 'ACC-88#login', '2026-10-14T22:10:00Z', 'Last login for j.wu on PROD_WH: Oct 14, 22:10 UTC.');

-- Memory the app writes: every card Claude generated and every accepted job.
CREATE TABLE IF NOT EXISTS LOOP_JOURNAL (
  EVENT_ID STRING DEFAULT UUID_STRING(), AT TIMESTAMP_TZ DEFAULT CURRENT_TIMESTAMP(),
  LOOP_ID STRING, EVENT STRING, MODEL STRING, DETAIL VARIANT
);

-- PATs need a network policy unless an authentication policy relaxes that for PATs.
CREATE AUTHENTICATION POLICY IF NOT EXISTS OPEN_LOOPS_PAT_POLICY
  PAT_POLICY = (NETWORK_POLICY_EVALUATION = ENFORCED_NOT_REQUIRED);
SET me = CURRENT_USER();
ALTER USER IDENTIFIER($me) SET AUTHENTICATION POLICY OPEN_LOOPS.PUBLIC.OPEN_LOOPS_PAT_POLICY;

-- Token for the local server (Snowflake SQL API, bearer auth). Copy the token_secret it returns.
-- Network policy may be required for PATs: https://docs.snowflake.com/en/user-guide/programmatic-access-tokens#prerequisites
ALTER USER ADD PROGRAMMATIC ACCESS TOKEN OPEN_LOOPS_DEMO ROLE_RESTRICTION = 'ACCOUNTADMIN' DAYS_TO_EXPIRY = 7;
SELECT CURRENT_ORGANIZATION_NAME() || '-' || CURRENT_ACCOUNT_NAME() AS SNOWFLAKE_ACCOUNT;
