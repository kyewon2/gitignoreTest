zip -r appindex_get.zip *.js package.json node_modules

if [ $? -eq 0 ]
    then
        echo appindex_get.zip
fi
