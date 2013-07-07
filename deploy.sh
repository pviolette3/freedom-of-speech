export RUNMONGO='yes'
export RUNLOG='yes'
export PORT=8080
if [[ "$1" == "-k" ]]
then
  nohup node app
else
  node app
fi

