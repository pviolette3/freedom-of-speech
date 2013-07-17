export RUNMONGO='yes'
export RUNLOG='yes'
export PORT=8080

echo "Recalculating weights...."
cd ml
bash iterate.sh
cd ..

echo "Launching node application.."
if [[ "$1" == "-k" ]]
then
  echo "Keeping server alive!"
  nohup node app
else
  echo "Launching"
  node app
fi

