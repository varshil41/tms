Steps to follow 

1) Clone the repo
2) npm install
3) Setup .env from taking reference of .env.example
4) npm run migration:run
5) ssh-keygen -t ecdsa -b 256 -m PEM -f jwt.key -N "" 
6) npm run dev

You can also get swagger document using this URL
{BASE_URL}/api-document