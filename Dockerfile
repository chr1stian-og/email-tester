# Use a imagem base do Node.js 18
FROM node:18

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante do código do projeto
COPY . .

# Construa o aplicativo React
RUN npm run build

# Instale o servidor estático para servir o build
RUN npm install -g serve

# Exponha a porta em que a aplicação irá rodar
EXPOSE 3003

# Comando para rodar o servidor estático
CMD ["serve", "-s", "build", "-l", "3003"]
