#!/usr/bin/env bash
#
# Loads the e2e test data into the database .env points at. See
# plan-e2e-test-data.md.
#
# Two variables, neither of them normally needed:
#   E2E_DATA_ENV_FILE  the env file to read the credentials from (.env)
#   E2E_PSQL           how to reach psql, for a database in a container
#                      (psql), e.g. "docker exec -i -e PGPASSWORD pg psql"

set -euo pipefail

cd "$(dirname "$0")/.."

env_file=${E2E_DATA_ENV_FILE:-.env}
psql_command=${E2E_PSQL:-psql}

if [ ! -f "$env_file" ]; then
  echo "env file \"$env_file\" not found" >&2
  exit 1
fi

# Read one variable out of the env file the way node --env-file does: an
# optional export prefix, optional surrounding quotes, and no expansion of
# anything in the value.
read_env_variable() {
  sed -nE "s/^[[:space:]]*(export[[:space:]]+)?$1=(.*)\$/\2/p" "$env_file" |
    tail -n 1 |
    sed -E -e 's/^"(.*)"$/\1/' -e "s/^'(.*)'\$/\1/"
}

PGHOST=$(read_env_variable DATABASE_HOST)
PGUSER=$(read_env_variable DATABASE_USER)
PGPASSWORD=$(read_env_variable DATABASE_PASSWORD)
PGDATABASE=$(read_env_variable DATABASE)
export PGHOST PGUSER PGPASSWORD PGDATABASE

for name in PGHOST PGUSER PGPASSWORD PGDATABASE; do
  if [ -z "${!name}" ]; then
    echo "\"$env_file\" has no value for $name" >&2
    exit 1
  fi
done

# The target is printed rather than confirmed: the only way to point this at
# anything but a local database is to put those credentials in the env file.
echo "e2e data -> $PGUSER@$PGHOST/$PGDATABASE"

# Fed on stdin rather than with -f so that a psql in a container takes it too.
# Each file is its own transaction, so a failure leaves the database as it was.
$psql_command -v ON_ERROR_STOP=1 --quiet < e2e-data/clean-e2e-data.sql
$psql_command -v ON_ERROR_STOP=1 --quiet < e2e-data/e2e-data.sql

echo "e2e data loaded"
