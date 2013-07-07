export RUNMONGO='yes'
export RUNLOG='yes'
export PORT=8080

echo "Refreshing weights..."
cd ml
./refresh_weights.sh
cd ../

echo "Launching node application.."
if [[ "$1" == "-k" ]]
then
  echo "Keeping server alive!"
  nohup node app
else
  echo "Launching"
  node app
fi

