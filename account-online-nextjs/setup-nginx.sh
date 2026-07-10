#!/bin/bash

#=============================================================================
# 🔧 PROJECT CONFIGURATION - CHANGE THESE FOR NEW PROJECTS
#=============================================================================

# Project Information
PROJECT_DISPLAY_NAME="Account Online frontend App"
APP_NAME="account-online-frontend"
PROJECT_DESCRIPTION="Account Online Frontend Application"

# Port Configuration
EXTERNAL_PORT=8282
INTERNAL_PORT=3131

# API Configuration
FRONTEND_API_URL="http://192.168.103.106:8282"
BACKEND_API_URL="http://192.168.103.106:7070"
SERVER_IP="192.168.103.106"

# SSL Configuration (Wildcard Certificates)
USE_SSL=false # Set to true to enable HTTPS / SSL
SSL_CERT_PATH="/etc/nginx/ssl/star_cambodiapostbank_com_kh.pem"
SSL_KEY_PATH="/etc/nginx/ssl/wildcard_cambodiapostbank_com_kh.key"

# Nginx Performance Settings
NGINX_CLIENT_MAX_BODY_SIZE="50M"
NGINX_PROXY_TIMEOUT="90s"
NGINX_KEEPALIVE_CONNECTIONS=32
NGINX_MAX_FAILS=3
NGINX_FAIL_TIMEOUT="30s"

# Cache Settings
STATIC_CACHE_TIME="1h"
NEXTJS_CACHE_TIME="5m"

# Debug Headers (automatically generated from above values)
HEADER_APP_NAME="${PROJECT_DISPLAY_NAME}-${EXTERNAL_PORT}"
HEADER_API_NAME="${APP_NAME}-backend"
HEADER_STATIC_NAME="${APP_NAME}-static"
HEADER_FRONTEND_NAME="${APP_NAME}-frontend"

# Health Check Message
HEALTH_CHECK_MESSAGE="${PROJECT_DISPLAY_NAME} - Server ${SERVER_IP} - External:${EXTERNAL_PORT} Internal:${INTERNAL_PORT} - OK"

#=============================================================================
# 🎨 SCRIPT STYLING AND FUNCTIONS (NO CHANGES NEEDED BELOW)
#=============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  🔧 SETUP NGINX FOR ${PROJECT_DISPLAY_NAME^^} 🔧                      ║${NC}"
echo -e "${BLUE}║                   (Configuration via Script Variables)                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    echo -e "${YELLOW}Usage: sudo ./setup-nginx.sh${NC}"
    exit 1
fi

# Load environment for any additional settings (optional)
if [ -f .env.production ]; then
    source .env.production
    echo -e "${GREEN}✅ Additional environment loaded from .env.production${NC}"
fi

# Extract backend host and port from BACKEND_API_URL
BACKEND_HOST=$(echo $BACKEND_API_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f1)
BACKEND_PORT=$(echo $BACKEND_API_URL | sed 's|http://||' | sed 's|https://||' | cut -d: -f2 | cut -d/ -f1)

echo -e "${CYAN}📋 Project Configuration:${NC}"
echo -e "${CYAN}   Project: ${BOLD}${PROJECT_DISPLAY_NAME}${NC}"
echo -e "${CYAN}   App Name: ${BOLD}${APP_NAME}${NC}"
echo -e "${CYAN}   External Port: ${BOLD}${EXTERNAL_PORT}${NC}"
echo -e "${CYAN}   Internal Port: ${BOLD}${INTERNAL_PORT}${NC}"
echo -e "${CYAN}   Frontend API: ${BOLD}${FRONTEND_API_URL}${NC}"
echo -e "${CYAN}   Backend API: ${BOLD}${BACKEND_API_URL}${NC}"
echo -e "${CYAN}   Backend Host: ${BOLD}${BACKEND_HOST}${NC}"
echo -e "${CYAN}   Backend Port: ${BOLD}${BACKEND_PORT}${NC}"
echo -e "${CYAN}   Server IP: ${BOLD}${SERVER_IP}${NC}"

echo -e "${CYAN}🔧 Setting up nginx configuration...${NC}"

# Remove old configs for THIS project only
echo -e "${YELLOW}🔍 Removing old nginx configs for ${APP_NAME}...${NC}"
rm -f /etc/nginx/conf.d/${APP_NAME}.conf

# Check for conflicts with other projects
echo -e "${CYAN}🔍 Checking for port conflicts...${NC}"
EXISTING_PORTS=$(grep -h "listen.*[0-9]" /etc/nginx/conf.d/*.conf 2>/dev/null | grep -o "[0-9]\+" | sort -u | tr '\n' ' ')
if [ ! -z "$EXISTING_PORTS" ]; then
    echo -e "${CYAN}   Existing nginx ports: ${EXISTING_PORTS}${NC}"
    if echo "$EXISTING_PORTS" | grep -q "$EXTERNAL_PORT"; then
        echo -e "${RED}❌ Port $EXTERNAL_PORT is already in use by another nginx config!${NC}"
        echo -e "${YELLOW}Please use a different EXTERNAL_PORT or remove the conflicting config${NC}"
        exit 1
    fi
fi

# Generate the listen and SSL configuration block
SSL_LISTEN_BLOCK=""
if [ "$USE_SSL" = true ]; then
    SSL_LISTEN_BLOCK="listen ${EXTERNAL_PORT} ssl;
    listen [::]:${EXTERNAL_PORT} ssl;
    ssl_certificate ${SSL_CERT_PATH};
    ssl_certificate_key ${SSL_KEY_PATH};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;"
else
    SSL_LISTEN_BLOCK="listen ${EXTERNAL_PORT};
    listen [::]:${EXTERNAL_PORT};"
fi

# Create production config using script variables with unique naming
cat > /etc/nginx/conf.d/${APP_NAME}.conf << EOF
# ${PROJECT_DISPLAY_NAME} - Frontend + API Proxy (Port: ${EXTERNAL_PORT})
# ${PROJECT_DESCRIPTION}
# Frontend calls: ${FRONTEND_API_URL}/api/* -> nginx proxy -> ${BACKEND_API_URL}/api/*
# UNIQUE UPSTREAM NAMES to avoid conflicts with other projects
upstream ${APP_NAME}_api_backend_${EXTERNAL_PORT} {
    server ${BACKEND_HOST}:${BACKEND_PORT} max_fails=${NGINX_MAX_FAILS} fail_timeout=${NGINX_FAIL_TIMEOUT};
    keepalive ${NGINX_KEEPALIVE_CONNECTIONS};
}

upstream ${APP_NAME}_frontend_${EXTERNAL_PORT} {
    server 127.0.0.1:${INTERNAL_PORT} max_fails=${NGINX_MAX_FAILS} fail_timeout=${NGINX_FAIL_TIMEOUT};
    keepalive ${NGINX_KEEPALIVE_CONNECTIONS};
}

server {
    ${SSL_LISTEN_BLOCK}
    server_name _;
    client_max_body_size ${NGINX_CLIENT_MAX_BODY_SIZE};

    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-App "${HEADER_APP_NAME}" always;
    add_header X-Project "${APP_NAME}-${EXTERNAL_PORT}" always;
    server_tokens off;

    # Connection settings
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_request_buffering off;
    proxy_connect_timeout ${NGINX_PROXY_TIMEOUT};
    proxy_send_timeout ${NGINX_PROXY_TIMEOUT};
    proxy_read_timeout ${NGINX_PROXY_TIMEOUT};

    # CRITICAL: API Proxy - Frontend calls ${FRONTEND_API_URL}/api/* 
    # This gets proxied to backend at ${BACKEND_API_URL}/api/*
    location /api/ {
        # Proxy to backend API server using unique upstream
        proxy_pass http://${APP_NAME}_api_backend_${EXTERNAL_PORT};
        
        # Standard proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # CORS headers for API calls
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With";
            add_header Access-Control-Allow-Credentials true;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        # Debug header to confirm API proxy
        add_header X-API-Proxy "${APP_NAME}-backend-${BACKEND_PORT}" always;
        add_header X-API-Target "${BACKEND_HOST}:${BACKEND_PORT}" always;
    }

    # Static files and assets - Serve from PM2 Next.js app
    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|css|js|map)\$ {
        proxy_pass http://${APP_NAME}_frontend_${EXTERNAL_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        expires ${STATIC_CACHE_TIME};
        add_header Cache-Control "public";
        add_header X-Static "${APP_NAME}-static-${INTERNAL_PORT}" always;
    }

    # Next.js static files
    location /_next/ {
        proxy_pass http://${APP_NAME}_frontend_${EXTERNAL_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        expires ${NEXTJS_CACHE_TIME};
        add_header Cache-Control "public";
        add_header X-Static "${APP_NAME}-nextjs-${INTERNAL_PORT}" always;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "${HEALTH_CHECK_MESSAGE}\n";
        add_header Content-Type text/plain;
        add_header X-Health "${APP_NAME}-${EXTERNAL_PORT}" always;
    }

    # Frontend pages - Serve from PM2 Next.js app
    location / {
        # Remove trailing slash
        if (\$request_uri ~ ^(.+)/\$) { 
            return 301 \$1; 
        }
        
        # Proxy to Next.js app running on PM2 using unique upstream
        proxy_pass http://${APP_NAME}_frontend_${EXTERNAL_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass \$http_upgrade;
        
        # Debug header to confirm frontend proxy
        add_header X-Frontend "${APP_NAME}-frontend-${INTERNAL_PORT}" always;
    }
}
EOF

echo -e "${GREEN}✅ Nginx config created for ${APP_NAME}${NC}"
echo -e "${CYAN}🔧 Configuration Summary:${NC}"
echo -e "${CYAN}   External Port: ${BOLD}${EXTERNAL_PORT}${NC}"
echo -e "${CYAN}   PM2 Internal Port: ${BOLD}${INTERNAL_PORT}${NC}"
echo -e "${CYAN}   Frontend API Calls: ${BOLD}${FRONTEND_API_URL}/api/*${NC}"
echo -e "${CYAN}   Backend Proxy Target: ${BOLD}${BACKEND_API_URL}/api/*${NC}"

# Test and reload nginx
echo -e "${CYAN}🔍 Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    echo -e "${YELLOW}Check the configuration file:${NC}"
    echo -e "${YELLOW}cat /etc/nginx/conf.d/${APP_NAME}.conf${NC}"
    exit 1
fi

# Show final status
echo ""
echo -e "${GREEN}🎉 Nginx setup completed for ${PROJECT_DISPLAY_NAME}!${NC}"
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                           🌐 ACCESS INFORMATION                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${CYAN}🌐 Application URLs:${NC}"
echo -e "${CYAN}  • Local: ${BOLD}http://localhost:${EXTERNAL_PORT}${NC}"
echo -e "${CYAN}  • Server: ${BOLD}http://${SERVER_IP}:${EXTERNAL_PORT}${NC}"
echo -e "${CYAN}🔗 API Endpoint (Frontend uses): ${BOLD}${FRONTEND_API_URL}/api/*${NC}"
echo -e "${CYAN}🔗 Backend Direct: ${BOLD}${BACKEND_API_URL}${NC}"
echo -e "${CYAN}🩺 Health Check: ${BOLD}http://${SERVER_IP}:${EXTERNAL_PORT}/health${NC}"
echo -e "${CYAN}🚀 PM2 App: ${BOLD}http://127.0.0.1:${INTERNAL_PORT}${NC}"

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                              🔧 CONFIGURATION                               ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${CYAN}📁 Config file: ${BOLD}/etc/nginx/conf.d/${APP_NAME}.conf${NC}"
echo -e "${CYAN}🔍 Check config: ${BOLD}cat /etc/nginx/conf.d/${APP_NAME}.conf${NC}"
echo -e "${CYAN}🔄 Reload nginx: ${BOLD}sudo systemctl reload nginx${NC}"
echo -e "${CYAN}📊 Check nginx: ${BOLD}sudo systemctl status nginx${NC}"

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                            ⚡ API FLOW SUMMARY                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}1. Frontend (Next.js) makes API calls to: ${BOLD}${FRONTEND_API_URL}/api/*${NC}"
echo -e "${YELLOW}2. Nginx receives request on port ${BOLD}${EXTERNAL_PORT}${NC}"
echo -e "${YELLOW}3. Nginx proxies /api/* requests to backend: ${BOLD}${BACKEND_API_URL}/api/*${NC}"
echo -e "${YELLOW}4. Nginx serves frontend pages from PM2: ${BOLD}127.0.0.1:${INTERNAL_PORT}${NC}"
echo -e "${YELLOW}5. Static files served through nginx proxy from PM2${NC}"

echo ""
echo -e "${GREEN}✅ Configuration completed! Frontend now uses ${FRONTEND_API_URL} through nginx proxy.${NC}"