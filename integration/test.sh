#!/bin/env bash
INTEGRATION_KEYWORD="rr-integration-express"
EXPECTED_HOME_BODY="Home Page"
EXPECTED_USERS_BODY="Users Index Page"
rm -f resource-routing-v*.tgz
yarn build
yarn pack
rm rf integration/node_modules/*
cd integration


echo "Installing packed resource-routing package in integration test"
yarn add ../resource-routing-v*.tgz
echo "FILE CHECKING........."
pwd
ls -latr node_modules/resource-routing/package.json
ls -latr node_modules/resource-routing/dist/index.js
echo "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
yarn start $INTEGRATION_KEYWORD &
sleep 2
echo "Integration test started"
HOME_BODY=`curl -s http://localhost:3000/`
USERS_BODY=`curl -s http://localhost:3000/users`
ps -ef  | grep $INTEGRATION_KEYWORD | grep -v grep  | awk '{print $2}' | xargs kill -9
git checkout package.json

if [ "$HOME_BODY" == "$EXPECTED_HOME_BODY" ] && [ "$USERS_BODY" == "$EXPECTED_USERS_BODY" ]; then
  echo "Integration test passed"
  exit 0
else
  if [ "$HOME_BODY" != "$EXPECTED_HOME_BODY" ]; then
    echo "Home body expected: EXPECTED_HOME_BODY"
    echo "Home body received: $HOME_BODY"
  fi

  if [ "$USERS_BODY" != "$EXPECTED_USERS_BODY" ]; then
    echo "Users body expected: $EXPECTED_USERS_BODY"
    echo "Users body received: $USERS_BODY"
  fi

  echo "Integration test failed"
  exit 1
fi


