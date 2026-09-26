-- The data the frontend e2e tests expect to find in the database.
--
-- See plan-e2e-test-data.md for what each item is for and why. Every value a
-- test looks for is also in frontend/e2e/constants.ts; the names here and
-- there have to agree.
--
-- The ids are fixed rather than generated, so that every row can be upserted
-- on its primary key and the file can be run any number of times. Rows that
-- carry values are repaired on a second run; the join rows carry nothing to
-- repair.
--
-- Run with e2e-data/populate.sh, never by hand against a database that
-- matters.

BEGIN;

-- The user. Three rows, the same ones the app writes when a password sign-in
-- method is added: the user, the method and the hash.
--
-- The hash is scrypt in the format crypto/crypto.service.ts writes, with the
-- parameters of web/password-hash-parameters.ts. scrypt is deterministic, so
-- the hash of "e2eadmin" under a fixed salt is a constant and no code is
-- needed to create the user. Committing it is safe: the password is
-- "e2eadmin", written next to it in e2e/constants.ts, for a test account on a
-- local database.
--
-- The hash has to be in the format and parameters the app writes, or the
-- first login of a seeded database rehashes the password in the middle of a
-- test run. Regenerate it when the parameters change.
INSERT INTO "user" (user_id, username, role)
VALUES ('e2e00000-0000-4000-8000-000000000001', 'e2eadmin', 'admin')
ON CONFLICT (user_id) DO UPDATE
  SET username = EXCLUDED.username, role = EXCLUDED.role;

INSERT INTO sign_in_method (user_id, type)
VALUES ('e2e00000-0000-4000-8000-000000000001', 'password')
ON CONFLICT (user_id, type) DO NOTHING;

INSERT INTO password_sign_in_method (user_id, password_hash)
VALUES ('e2e00000-0000-4000-8000-000000000001',
        '$scrypt$ln=15,r=8,p=3$DmgsN7yYw0Bf00RRWqkHAg$l+mah3VlXnj0ipUiOSrAbCo8hUScnN3KIQA2pw+t1HEypfENQ9SBn7DfgqvkLNA8swDR8OdojwiimbAu1H85xw')
ON CONFLICT (user_id) DO UPDATE
  SET password_hash = EXCLUDED.password_hash;

-- The brewery. The country has to be FI for the brewery country statistics
-- to have the row the test looks for.
INSERT INTO brewery (brewery_id, name, country)
VALUES ('e2e00000-0000-4000-8000-000000000002',
        'Aaa E2E Remarkable Ales Co',
        'FI')
ON CONFLICT (brewery_id) DO UPDATE
  SET name = EXCLUDED.name, country = EXCLUDED.country;

-- The style. No parents: no test reads a style's parents or children.
INSERT INTO style (style_id, name)
VALUES ('e2e00000-0000-4000-8000-000000000003', 'Aaa E2E American IPA')
ON CONFLICT (style_id) DO UPDATE
  SET name = EXCLUDED.name;

-- The beer. Not named after its style: a beer list row holds both names, so
-- two elements would carry the same text and Playwright's strict mode would
-- fail the getByText.
INSERT INTO beer (beer_id, name)
VALUES ('e2e00000-0000-4000-8000-000000000004', 'Aaa E2E Remarkable IPA')
ON CONFLICT (beer_id) DO UPDATE
  SET name = EXCLUDED.name;

INSERT INTO beer_brewery (beer, brewery)
VALUES ('e2e00000-0000-4000-8000-000000000004',
        'e2e00000-0000-4000-8000-000000000002')
ON CONFLICT (beer, brewery) DO NOTHING;

INSERT INTO beer_style (beer, style)
VALUES ('e2e00000-0000-4000-8000-000000000004',
        'e2e00000-0000-4000-8000-000000000003')
ON CONFLICT (beer, style) DO NOTHING;

-- The container. Shown as type + ' ' + size, so this is the "e2e can 0.25"
-- the container picker and the annual container statistics look for.
INSERT INTO container (container_id, type, size)
VALUES ('e2e00000-0000-4000-8000-000000000005', 'e2e can', '0.25')
ON CONFLICT (container_id) DO UPDATE
  SET type = EXCLUDED.type, size = EXCLUDED.size;

INSERT INTO location (location_id, name)
VALUES ('e2e00000-0000-4000-8000-000000000006',
        'Aaa E2E Beergarden, Tampere')
ON CONFLICT (location_id) DO UPDATE
  SET name = EXCLUDED.name;

-- The reviews. One review is what gives the brewery, brewery country,
-- location, style, rating, annual and annual container statistics a row at
-- all, and it has to satisfy the statistics page's default filters: rating at
-- least 4, a time inside 2017-12 ... next month, and a location set. The year
-- is 2021 because that is the year the annual statistics tests look for.
INSERT INTO review (review_id, beer, container, location, rating,
                    smell, taste, time, additional_info)
VALUES ('e2e00000-0000-4000-8000-000000000007',
        'e2e00000-0000-4000-8000-000000000004',
        'e2e00000-0000-4000-8000-000000000005',
        'e2e00000-0000-4000-8000-000000000006',
        8,
        'Smells nice',
        'Tastes good',
        '2021-06-15T18:00:00.000Z',
        '')
ON CONFLICT (review_id) DO UPDATE
  SET beer = EXCLUDED.beer,
      container = EXCLUDED.container,
      location = EXCLUDED.location,
      rating = EXCLUDED.rating,
      smell = EXCLUDED.smell,
      taste = EXCLUDED.taste,
      time = EXCLUDED.time,
      additional_info = EXCLUDED.additional_info;

-- The second review is dated 2100 so that the annual statistics have a year
-- that sorts first and stays there. Both annual views are ordered by year
-- descending, and the annual and container one is loaded a page at a time,
-- so a row in a past year sinks a page further down with every year that
-- passes and every container reviewed in one. A year no review will reach
-- keeps the row on the first page for good, which is what lets the tests
-- name the year as a constant.
--
-- It is not enough on its own, which is why the 2021 one stays: the brewery,
-- brewery country, location and style statistics filter by time, to
-- 2017-12 ... next month unless the url says otherwise, so this review is
-- not in any of them. Nothing on the backend minds a review in the future;
-- the filter's upper bound is the UI keeping its sliders sensible.
INSERT INTO review (review_id, beer, container, location, rating,
                    smell, taste, time, additional_info)
VALUES ('e2e00000-0000-4000-8000-000000000008',
        'e2e00000-0000-4000-8000-000000000004',
        'e2e00000-0000-4000-8000-000000000005',
        'e2e00000-0000-4000-8000-000000000006',
        8,
        'Smells nice',
        'Tastes good',
        '2100-06-15T18:00:00.000Z',
        '')
ON CONFLICT (review_id) DO UPDATE
  SET beer = EXCLUDED.beer,
      container = EXCLUDED.container,
      location = EXCLUDED.location,
      rating = EXCLUDED.rating,
      smell = EXCLUDED.smell,
      taste = EXCLUDED.taste,
      time = EXCLUDED.time,
      additional_info = EXCLUDED.additional_info;

COMMIT;
