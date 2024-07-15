#!/usr/bin/env bash -eu

# get the dir containing the script
script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# create a temporary working directory
working_dir=$(mktemp -d "${TMPDIR:-/tmp/}openmrs-e2e-frontends.XXXXXXXXXX")
# get the app name
app_name=$(jq -r '.name' "$script_dir/../../../package.json")

echo "Creating packed archive of the app..."
# @openmrs/esm-whatever -> _openmrs_esm_whatever
packed_app_name=$(echo "$app_name" | tr '[:punct:]' '_');
# run yarn pack for our app and add it to the working directory
yarn pack -o "$working_dir/$packed_app_name.tgz" >/dev/null;
echo "Created packed app archives" 

echo "Creating dynamic spa-assemble-config.json..."
# dynamically assemble our list of frontend modules, prepending the login app and
# primary navigation apps; apps will all be in the /app directory of the Docker
# container
jq -n \
  --arg app_name "$app_name" \
  --arg app_file "/app/$packed_app_name.tgz" \
  '{"@openmrs/esm-primary-navigation-app": "next"} + {
    ($app_name): $app_file
  }' | jq '{"frontendModules": .}' > "$working_dir/spa-assemble-config.json"
echo "Created dynamic spa-assemble-config.json"

echo "Copying Docker configuration..."
cp "$script_dir/Dockerfile" "$working_dir/Dockerfile"
cp "$script_dir/docker-compose.yml" "$working_dir/docker-compose.yml"

cd $working_dir
echo "Starting Docker containers..."
# CACHE_BUST to ensure the assemble step is always run
docker compose build --build-arg CACHE_BUST=$(date +%s) frontend
docker compose up -d
