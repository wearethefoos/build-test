FROM node:11-alpine

RUN apk update && \
  apk add \
  bash \
  openssh \
  git

RUN yarn global add \
  typescript \
  tslint

RUN addgroup -S codaisseur && \
  adduser -S runner -G codaisseur -s /bin/bash -h /runner

RUN mkdir /project && \
  chown -R runner:codaisseur /project

USER runner

WORKDIR /runner

ENTRYPOINT [ "/bin/bash", "-c" ]

CMD ["yarn", "start"]
