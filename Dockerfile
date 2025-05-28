FROM oven/bun:latest

WORKDIR /app

COPY package.json package.json

COPY . .

RUN bun i

CMD [ "./start.sh" ]