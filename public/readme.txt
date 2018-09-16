
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