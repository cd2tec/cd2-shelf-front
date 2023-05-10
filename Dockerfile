FROM gitlab-dreg.nexxera.com/devops/dockerimages/nginx:1.12.0-alpine3.6

MAINTAINER Nexxera DevOps "devops@nexxera.com"

COPY ./build /usr/share/nginx/html

COPY ./docker/default.conf /etc/nginx/conf.d/default.conf

RUN sed -i "s?APPDIR=/app?APPDIR=/usr/share/nginx/html/?" entrypoint.sh && \
    sed -i "3iif env |fgrep -q URL;then env|fgrep URL|sed 's/=/:/\' > /app/requirements.env ; fi" /entrypoint.sh && \
    sed -i "4iif env |fgrep -q UNITRIER_SERVICE_BACKEND;then sed "s/unitrier.route:port/'${UNITRIER_SERVICE_BACKEND}'/" /etc/nginx/conf.d/default.conf > /tmp/default.conf; cat /tmp/default.conf > /etc/nginx/conf.d/default.conf ; fi" /entrypoint.sh && \
    chmod 666 /etc/nginx/conf.d/default.conf && \
    chmod -R 777 /usr/share/nginx/*

EXPOSE 8080
