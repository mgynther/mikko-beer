-- What a run of the e2e suite leaves behind.
--
-- add-review.spec.ts and add-storage.spec.ts each create a beer named
-- "e2e test beer <uuid>" and a review or a storage for it, on every run, so a
-- database the suite is run against often fills up with them. The prefix is
-- what makes them findable; the seeded beer is "Aaa E2E Remarkable IPA" and
-- is never matched.
--
-- This runs before e2e-data.sql on every populate.sh run, so the suite starts
-- from the declared data rather than from what the last run happened to
-- leave.

BEGIN;

CREATE TEMPORARY TABLE e2e_run_beer ON COMMIT DROP AS
SELECT beer_id FROM beer WHERE name LIKE 'e2e test beer %';

DELETE FROM storage WHERE beer IN (SELECT beer_id FROM e2e_run_beer);
DELETE FROM review WHERE beer IN (SELECT beer_id FROM e2e_run_beer);
DELETE FROM beer_brewery WHERE beer IN (SELECT beer_id FROM e2e_run_beer);
DELETE FROM beer_style WHERE beer IN (SELECT beer_id FROM e2e_run_beer);
DELETE FROM beer WHERE beer_id IN (SELECT beer_id FROM e2e_run_beer);

-- One refresh token per login, eight logins per run of the suite.
DELETE FROM refresh_token
WHERE user_id = 'e2e00000-0000-4000-8000-000000000001';

COMMIT;
