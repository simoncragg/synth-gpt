FROM public.ecr.aws/lambda/python:3.11
COPY requirements.txt ${LAMBDA_TASK_ROOT}
COPY src/* ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt
CMD [ "lambda_function.handler" ]
