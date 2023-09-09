#!/bin/sh

# https://docs.aws.amazon.com/lambda/latest/dg/images-test.html

curl -Lo aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie-arm64 \
&& chmod +x aws-lambda-rie

COPY ./entry_script.sh /entry_script.sh
ADD aws-lambda-rie /usr/local/bin/aws-lambda-rie
ENTRYPOINT [ "/entry_script.sh" ]

docker build --platform linux/amd64 -f Dockerfile -t synth-code-interpreter .
