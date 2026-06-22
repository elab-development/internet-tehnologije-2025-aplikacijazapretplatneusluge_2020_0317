# Patron Star – Platforma za podršku kreatorima

## Opis aplikacije
Patron Star je web aplikacija koja omogućava kreatorima (umetnicima, muzičarima, blogerima, programerima, itd.) da nude svoj rad kroz sistem mesečnih pretplati (nivoa). Korisnici (patroni) se pretplaćuju na kreatore kako bi dobili ekskluzivni sadržaj i podržali njihov rad.

Aplikacija sadrži tri osnovna tipa korisnika:
 - Patron – može da pregleda kreatore, pretplati se na njih, vidi objave i upravlja svojim pretplatama.
 - Kreator – može da kreira nivoe pretplate, objavljuje sadržaj (javni, samo za pretplatnike ili za određeni nivo), prati broj pretplatnika i zaradu.
 - Admin – ima uvid u sve korisnike i kreatore, može ih uređivati i brisati, te pregledati statistike platforme.

Takođe, aplikacija podržava gostujući pristup (bez registracije) uz ograničen pristup javnim objavama i listi kreatora.

## Korišćene tehnologije

### Frontend
- React – razvoj korisničkog interfejsa
- Mantine – stilizacija korisničkog interfejsa
- Axios – komunikacija sa backend API-jem
- Recharts – vizualizacija podataka

### Backend
- Laravel – razvoj REST API backend sistema
- Laravel Sanctum – autentifikacija i zaštita ruta
- Eloquent ORM – rad sa bazom podataka

### Baza podataka
- MySQL – čuvanje korisnika, kreatora, objava, pretplata, nivoa pretplata i transakcija

### DevOps i alati
- Docker – kontejnerizacija aplikacije
- Docker Compose – orkestracija servisa
- GitHub – verzionisanje projekta

## Struktura projekta
Projekat je podeljen na dva glavna dela:
- react-front/ – React aplikacija
- laravel-bek/ – Laravel API

## Pokretanje aplikacije lokalno

### 1. Klonirajte repozitorijum i uđite u backend folder:
```bash
git clone <repo_url>
cd laravel-bek
```
### 2. Pokretanje backend-a  

Kopirajte .env fajl i podesite podatke o bazi:
```bash
cp .env.example .env
```

Podesite .env:
```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_bek
DB_USERNAME=root
DB_PASSWORD= (ostaviti prazno)
```

Instalirajte PHP zavisnosti::
```bash
composer install
```

Generisati aplikacijski ključ:
```bash
php artisan key:generate
```

Pokrenuti migracije i seedere:
```bash
php artisan migrate --seed
```

Pokrenuti Laravel server:
```bash
php artisan serve
```

Backend je sad dostupan na:
```
http://127.0.0.1:8000
```
### 3. Pokretanje frontend-a
U novom terminalu preći u frontend direktorijum:

```bash
cd react-front
```

Instalirati zavisnosti:
```bash
npm install
```
Osigurati da je proxy dobro podešen u package.json:
```json
"proxy": "http://127.0.0.1:8000"
```

Pokrenuti development server:
```bash
npm start
```

Frontend će se otvoriti na http://localhost:3000


## Pokretanje aplikacije pomoću Docker-a

Ova metoda pokreće kompletnu aplikaciju (bazu, backend, frontend) unutar Docker kontejnera.

### Osigurati da su .env u backendu i packages.json u frontendu podešeni:
.env:
```ini
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel_bek
DB_USERNAME=root
DB_PASSWORD=root
```
package.json
```json
"proxy": "http://backend:8000"
```

### Pokretanje prvi put
```bash
docker-compose up --build
```

### Pokretanje migracija nad bazom i popunjavanje podacima
```bash
docker exec -it patron_star_backend php artisan migrate
```
```bash
docker exec -it patron_star_backend php artisan db:seed
```

### Svako naredno pokretanje
```bash
docker-compose up
```
### Zaustavljanje servisa
```bash
docker-compose down
```

## Dodatne informacije
 - API dokumentacija (Swagger/OpenAPI) – nakon pokretanja backend-a dostupna na /api/documentation.
 - Demo podaci – seederi kreiraju nekoliko patrona, kreatora, objava i pretplati (korisnik admin@example.com / admin123).
 - Eksterni API-jevi – za kurseve i citate keširaju se na 2 sata (smanjuje se broj zahteva).

## Autor
- Stefan Filipović – 2020/0317

