FROM node:11-alpine

RUN apk update && \
  apk add \
    bash \
    openssh \
    git

RUN yarn global add \
  typscript \
  tslint

RUN addgroup -S codaisseur && \
  adduser -S builder -G codaisseur -s /bin/bash -h /builder

RUN mkdir /project && \
  chown -R builder:codaisseur /project

USER builder

WORKDIR /builder

ENV PORT 3030

ENTRYPOINT [ "/bin/bash", "-c" ]

CMD ["yarn", "start"]
