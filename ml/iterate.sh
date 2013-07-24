#!/bin/bash
if ls *uncensored.txt > /dev/null 2>&1
then
  export directory=archive/$(date "+%F%T")
  mkdir $directory 
  mkdir $directory/uncensored
  mkdir $directory/censored
  cat *uncensored.txt > un2ensored.txt
  mv *uncensored.txt $directory/uncensored/

  cat *censored.txt > 2ensored.txt
  mv *censored.txt $directory/censored/

  mv 2ensored.txt censored.txt
  mv un2ensored.txt uncensored.txt
  python grey_list_generator.py > greylist.txt
  python weights_generator.py > weights.txt
  mv censored.txt $directory/censored/
  mv uncensored.txt $directory/uncensored/
else
  echo no new updates to greylist
fi
