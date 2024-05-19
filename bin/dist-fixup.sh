#!/bin/env bash

function usage(){
  echo "USAGE: ./fix-js-extensions.sh [esm|cjs]"
  exit 1
}

#echo THIS IS THE FIX JS EXTENSIONS SCRIPT
#echo "BEFORE FIXING JS EXTENSIONS"


DIRS=("esm" "cjs")
DIR=$1 # 'esm' or 'cjs'

if [[ "$DIR" == "" ]]; then
  usage
fi

if ! [[ "${DIRS[@]}" =~ "$DIR" ]]; then
  usage
fi

#echo "DIR: $DIR"
#cat dist/$DIR/index.js
sed -i 's/lib\/resource-routing"/lib\/resource-routing.js"/' dist/$DIR/index.js
sed -i "s/.\/render'/.\/render.js'/" dist/$DIR/lib/resource-routing.js
#sed -i s/default/WAT/ dist/esm/index.js

#echo "AFTER FIXING JS EXTENSIONS"
#cat dist/$DIR/index.js
#head dist/$DIR/lib/resource-routing.js


case $DIR in
  esm)
    echo '{ "type": "module" }' > dist/$DIR/package.json
    ;;
  cjs)
    echo '{ "type": "commonjs" }' > dist/$DIR/package.json
    ;;
esac
