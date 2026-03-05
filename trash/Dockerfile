FROM node:18-bullseye

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install Node.js dependencies
RUN npm install
RUN cd backend && npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy application code
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000 5000 5007 8000

# Create startup script
RUN echo '#!/bin/bash\n\
cd /app/backend && node server.js &\n\
cd /app && python3 direct_minicpm_server.py &\n\
cd /app && python3 asr_backend.py &\n\
cd /app && npm run preview\n\
' > start.sh && chmod +x start.sh

CMD ["./start.sh"]