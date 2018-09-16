
        location / {
            proxy_pass http://localhost:1337;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        location /public {
            root ./public;
        }





root         /usr/share/nginx/html;

fbbotfb.hardcoreg.com
public
sudo service nginx restart

//todo 
server { 
    listen       8080;
    listen       443 ssl;
    server_name  localhost;
    ssl_certificate  /etc/nginx/ssl/server.crt 
    ssl_certificate_key /etc/nginx/ssl/server.key
    location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    }
    location /public {
    root /usr/local/var/www;
    }
}

//org
upstream fbbotfb {
        server 35.237.178.5:11435 weight=10 max_fails=3 fail_timeout=30s;
    }

    server {
        listen       443 ssl http2;
        server_name  fbbotfb.hardcoreg.com;
        root         /usr/share/nginx/html;

        ssl on;
        ssl_certificate "/etc/pki/nginx/newserver.crt";
        ssl_certificate_key "/etc/pki/nginx/hardcoreg.com.key";
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;

        ssl_verify_depth 1;
        ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:ECDHE-RSA-AES128-GCM-SHA256:AES256+EECDH:DHE-RSA-AES128-GCM-SHA256:AES256+EDH:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";
        ssl_prefer_server_ciphers on;

        location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering on;
        proxy_buffer_size 32k;
        proxy_buffers 64 32k;

        proxy_redirect off;
        proxy_set_header X-Scheme $scheme;
        proxy_pass http://fbbotfb;
        }
    }
