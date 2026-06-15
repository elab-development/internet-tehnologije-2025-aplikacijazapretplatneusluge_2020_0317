# (1) Bazni image: Node.js 20 na Alpine Linux-u
FROM node:20-alpine

# (2) Podešavanje radnog direktorijuma
WORKDIR /app

# (3) Kopiranje fajlova sa listom zavisnosti
COPY package*.json ./

# (4) Instalacija JavaScript dependenci
RUN npm install

# (5) Kopiranje celokupnog koda aplikacije
COPY . .

ENV HOST=0.0.0.0
# (6) Otvaranje porta (informativno)
EXPOSE 3000

# (7) Komanda koja pokreće Vite development server
CMD ["npm", "start"]