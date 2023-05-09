#!/bin/bash

#run script from /home/$user folder
#create output.txt in /home/$user folder
touch output.txt

#going 2 levels down to root
cd ..
cd ..

# printing all directories 2 levels deep from root to file output.txt
for dir in */; do
    if [ -d "$dir" ]; then	
        cd "$dir"
        for dir2 in */; do
            if [ -d "$dir2" ]; then		
		ls -d "$PWD"/* >> "/home/akhauryp/output.txt";                
            fi
        done
        cd ..
    fi
done
