# (1) Bazni image: PHP 8.4 CLI na Alpine Linux (mala distribucija)
FROM php:8.4-cli-alpine

# (2) Instalacija sistemskih alata i PHP ekstenzija
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    libzip-dev \
    unzip

# (3) Instalacija PHP ekstenzija potrebnih za Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# (4) Kopiranje Composer-a iz zvaničnog image-a
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# (5) Podešavanje radnog direktorijuma
WORKDIR /var/www

# (6) Kopiranje Composer fajlova (optimizacija keširanja)
COPY composer.json composer.lock ./

# (7) Instalacija PHP dependenci (bez development alata)
RUN composer install --no-scripts --no-autoloader --prefer-dist --no-dev

# (8) Kopiranje celokupnog koda
COPY . .

# (9) Generisanje autoloadera i podešavanje permisija
RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# (10) Otvaranje porta (informativno)
EXPOSE 8000

# (11) Komanda koja se izvršava kada se kontejner pokrene
CMD php artisan serve --host=0.0.0.0 --port=8000