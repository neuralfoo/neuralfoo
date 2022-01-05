# Neural Foo
No code tool for testing apis.


## Code Structure and Setup

nffrontend - React js code containing forntend. Can run using the command `./startup_prod.sh`

nfbackend - Backend code written in flask and served using gunicorn (python3.8). Can run using the `./docker_build.sh` to build the docker and `./docker_run.sh` to run the docker. 

fs - seaweedfs distributed file system used to store the files. Need to download binary from [seaweedfs release](https://github.com/chrislusf/seaweedfs/releases/tag/2.83) .Can run by running `./master.sh` and 
`/volume.sh` in seperate shell terminals.

You also need to run mongodb server on the default port of 27017


