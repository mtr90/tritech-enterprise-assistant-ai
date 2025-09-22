# TriTech Enterprise Assistant - AI Enhanced

A secure, intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities powered by Claude API.

## 🚀 Features

### **🧠 Hybrid Intelligence**
- **Local Fast Responses**: Simple queries processed instantly using local knowledge base
- **AI-Enhanced Analysis**: Complex queries get deep analysis from Claude API
- **Smart Routing**: Automatically determines the best intelligence source for each query
- **Visual Source Indicators**: Clear badges showing whether response is "🤖 AI Enhanced" or "⚡ Fast Local"

### **🔒 Security & Best Practices**
- **API Keys Protected**: All sensitive keys stored securely on backend, never exposed to client
- **Rate Limiting**: Built-in protection against abuse with configurable limits
- **Input Validation**: Comprehensive sanitization and validation of all user inputs
- **Security Headers**: Full security header implementation (CSP, XSS protection, etc.)
- **Environment Variables**: Proper separation of development and production configurations

### **📚 Comprehensive Knowledge Base**
- **Premium Tax**: Annual & estimate returns, retaliatory calculations, GFA credits
- **Municipal Tax**: Local jurisdiction management, address-based allocation
- **FormsPlus**: Additional state-specific forms and integration capabilities
- **Allocator**: Multi-state allocation formulas and apportionment calculations
- **GFA Tracking System**: Guaranty Fund Assessment credits and tracking
- **Calendar**: Due date management and multi-jurisdiction tracking

### **🎨 Professional UI**
- **Dark Theme**: Professional color scheme matching enterprise standards
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Professional transitions and micro-interactions
- **Confidence Indicators**: Visual feedback on response quality and source

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes with secure environment handling
- **AI Integration**: Claude API with intelligent routing and fallback
- **Deployment**: Vercel with automatic GitHub integration
- **Security**: Rate limiting, input validation, security headers

## 🚀 Deployment

### **Environment Variables Required**

```bash
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Security
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Rate Limiting (Optional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### **Vercel Deployment**

1. **Connect Repository**: Link this GitHub repository to your Vercel account
2. **Set Environment Variables**: Add the required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy on every push to main branch

### **Local Development**

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# Start development server
pnpm run dev
```

## 🔧 Configuration

### **API Rate Limiting**
- Default: 20 requests per minute per IP
- Configurable via environment variables
- Automatic fallback to local responses when rate limited

### **Security Features**
- Input sanitization and validation
- XSS protection headers
- CSRF protection
- Content Security Policy
- Rate limiting per IP address

### **Smart Query Routing**
The system automatically routes queries based on complexity:

**Local Processing (Fast):**
- Simple feature questions
- Basic procedural queries
- High-confidence keyword matches

**Claude API (AI Enhanced):**
- Comparison requests
- Comprehensive analysis
- Low local confidence matches
- Complex multi-part questions

## 📖 Usage Examples

### **Simple Queries (Local)**
- "How to activate form"
- "Premium Tax features"
- "Municipal rollover process"

### **Complex Queries (AI Enhanced)**
- "Compare all Premium Tax features with Municipal"
- "Analyze data flow between all products"
- "List all Allocator capabilities and integrations"

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Claude API    │
│   (Next.js)     │◄──►│   (Secure)       │◄──►│   (External)    │
│                 │    │                  │    │                 │
│ • Smart UI      │    │ • Rate Limiting  │    │ • AI Analysis   │
│ • Local KB      │    │ • Validation     │    │ • Deep Insights │
│ • Routing Logic │    │ • Security       │    │ • Fallback      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔐 Security Considerations

- **Never commit `.env.local`** - Contains sensitive API keys
- **API keys are server-side only** - Never exposed to client
- **Rate limiting prevents abuse** - Configurable per environment
- **Input validation** - All user inputs are sanitized
- **Security headers** - Full protection against common attacks

## 📝 License

This project is proprietary software for TriTech Enterprise systems.

## 🤝 Support

For technical support or questions about the TriTech Enterprise Assistant, please contact the development team.
