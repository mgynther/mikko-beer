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
cp -r ../../frontend/build/* ./static

rm -rf .platform
mkdir -p .platform/nginx/conf.d/elasticbeanstalk/

cat << EOF >> .platform/nginx/conf.d/elasticbeanstalk/00_application.conf
location /api {
    proxy_pass http://localhost:8080/api;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
}

location / {
  root /var/app/current/static;
  try_files \$uri /index.html;
}

EOF

zipfile=mikko-beer-backend-$time.zip
zip -r $zipfile * .env .platform
cd ..
mv prod_dist/$zipfile .

echo "Created $zipfile"
