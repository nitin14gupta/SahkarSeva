# SahkarSeva
Labour Cooperative Federations and Societies have a large pool of skilled workers — electricians, plumbers, carpenters, painters, domestic helpers, caregivers, drivers, gardeners, cleaners and technicians — but no digital platform to connect them to households and institutions. 


Setup db via

docker run --name sahkarseva-postgres `
  -e POSTGRES_USER=sahkarseva `
  -e POSTGRES_PASSWORD=sahkarseva123 `
  -e POSTGRES_DB=sahkarseva `
  -p 5432:5432 `
  -v sahkarseva-postgres-data:/var/lib/postgresql/data `
  -d postgres:16

  