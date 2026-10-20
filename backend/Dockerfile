# ==========================================
# 1. Estágio de Build (Instalação e Compilação)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência e configuração do TypeScript
COPY package*.json tsconfig.json ./

# Instala todas as dependências (incluindo devDependencies para o build do TS)
RUN npm ci

# Copia todo o código fonte (incluindo a pasta src/)
COPY . .

# Roda o build do TypeScript (o tsc vai ler o tsconfig.json, compilar o 'src' e gerar a pasta 'dist')
RUN npm run build


# ==========================================
# 2. Estágio de Produção (Limpo e Seguro)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production

# Cria um usuário sem privilégios root por segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copia os arquivos de dependência e instala APENAS dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia APENAS o código compilado da pasta 'dist' gerada no estágio anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Alterna para o usuário não-root
USER nodejs

# Porta em que a aplicação roda (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar a aplicação rodando o JavaScript compilado
CMD ["node", "dist/main.js"]