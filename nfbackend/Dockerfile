FROM python:3.8-slim

WORKDIR /app

COPY . .

RUN pip3.8 install -r requirements.txt
RUN apt update -y
RUN apt install -y curl libglib2.0-0 libsm6 libxrender1 libxext6
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g pm2

CMD ["./startup.sh"]

