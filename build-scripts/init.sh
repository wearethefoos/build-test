#!/bin/sh

echo -e "Getting code..."
git clone -q --depth 1 $REPO_URL .

echo -e "Checking out $GIT_REF"
git checkout $GIT_REF

echo "Done!"
