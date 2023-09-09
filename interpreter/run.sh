#!/bin/bash
env=$1
docker run -p 9000:8080 --name code-interpreter-$env synth-code-interpreter
