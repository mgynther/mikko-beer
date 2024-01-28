#!/bin/bash

if [ "$#" != "1" ]; then
  echo "Usage $0 <zipfile>"
  exit 1
fi

zipfile=$1

aws s3 cp $zipfile s3://mikko-beer-zips

aws elasticbeanstalk create-application-version --application-name mikko-beer-backend --version-label $zipfile --source-bundle S3Bucket="mikko-beer-zips",S3Key="$zipfile"
aws elasticbeanstalk update-environment --application-name mikko-beer-backend --environment-name Mikko-beer-backend-env --version-label $zipfile
