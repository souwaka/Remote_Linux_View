FROM python:3.11-slim

# Node.jsをインストール
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# ファイルをコンテナ内にコピー
COPY backend/requirements.txt ./backend/
RUN pip install -r backend/requirements.txt

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY . .

EXPOSE 8000 3000

# 起動コマンド（CMDのあとに半角スペースを入れる）
CMD ["sh", "-c", "python3 backend/main.py & cd frontend && npm run dev"]
