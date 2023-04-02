#!/bin/bash

cd ../frontend
npm run build
cd ../backend

npm run build

rm -rf prod_dist
mkdir prod_dist
cp -r dist prod_dist
cp package.json prod_dist
cp package-lock.json prod_dist
cp ../private/backend_prod_env prod_dist/.env

time=$(date '+%y%m%d-%H%M%S')
echo $time
cd prod_dist
npm ci
mkdir static
cp -r ../../frontend/build/* ./
rm -rf .ebextensions
mkdir .ebextensions

cat << EOF >> .ebextensions/static-files.config
option_settings:
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /static: static
    /asset-manifest.json: asset-manifest.json
    /favicon.ico: favicon.ico
    /index.html: index.html
    /logo192.png: logo192.png
    /logo512.png: logo512.png
    /manifest.json: manifest.json
    /robots.txt: robots.txt
EOF

zipfile=mikko-beer-backend-$time.zip
zip -r $zipfile * .env .ebextensions
cd ..
mv prod_dist/$zipfile .
