# ==========================================
# 1. Estágio de Build (Instalação e Compilação)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (aproveita o cache do Docker)
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies necessárias para build, se houver)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Se a sua aplicação precisar de um passo de build (ex: TypeScript, Next.js, etc.)
# Descomente a linha abaixo:
# RUN npm run build

# ==========================================
# 2. Estágio de Produção (Limpo e Seguro)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Define o ambiente como produção
ENV NODE_ENV=production

# Cria um usuário sem privilégios root por segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copia os arquivos de dependência e instala APENAS dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia o código compilado/fonte do estágio anterior
COPY --chown=nodejs:nodejs . .

# Se você usa um diretório de build (ex: dist/ ou build/), ajuste o COPY acima ou copie apenas o necessário:
# COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Alterna para o usuário não-root
USER nodejs

# Porta em que a aplicação roda (ajuste conforme necessário)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]