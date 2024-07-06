FROM node:22-alpine as build

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

FROM busybox:stable-musl as serve

COPY --from=build /app/src/dist /public
COPY ./entrypoint.sh /entrypoint.sh

EXPOSE 3216

CMD ["./entrypoint.sh"]