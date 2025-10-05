# Cloudflare Pages Deployment Guide

## 🚀 Quick Deployment Steps

### Method 1: Manual Cloudflare Pages Deployment (Recommended)

1. **Visit Cloudflare Pages Dashboard**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Login to your Cloudflare account

2. **Connect GitHub Repository**
   - Click "Create a project" → "Connect to Git"
   - Select GitHub and authorize Cloudflare
   - Choose repository: `Nagen-bot/my-saferide-school`
   - Click "Begin setup"

3. **Configure Build Settings**
   ```
   Project name: school-van-ride
   Production branch: main
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   ```

4. **Environment Variables** (Optional for now)
   - No environment variables needed initially
   - Database will be added later

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be available at: `https://school-van-ride.pages.dev`

### Method 2: Wrangler CLI (Advanced)

If you have the correct Cloudflare API permissions:

```bash
# Create project
npx wrangler pages project create school-van-ride --production-branch main

# Deploy
npm run build
npx wrangler pages deploy dist --project-name school-van-ride
```

## 🗄️ Database Setup (Optional)

### Step 1: Create D1 Database
```bash
npx wrangler d1 create webapp-production
```

### Step 2: Update wrangler.jsonc
Add the database ID from step 1:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production", 
      "database_id": "your-database-id-here"
    }
  ]
}
```

### Step 3: Apply Migrations
```bash
# Production migrations
npx wrangler d1 migrations apply webapp-production

# Seed data (optional)
npx wrangler d1 execute webapp-production --file=./seed.sql
```

### Step 4: Update Pages Project
```bash
# Redeploy with database
npm run build
npx wrangler pages deploy dist --project-name school-van-ride
```

## 🔧 Custom Domain (Optional)

1. Go to Cloudflare Pages dashboard
2. Select your project: `school-van-ride`
3. Go to "Custom domains" tab
4. Add your domain (e.g., `vanride.school.my`)
5. Update DNS records as instructed

## 📊 Monitoring & Analytics

### Cloudflare Analytics
- Visit your Pages project dashboard
- View traffic, performance metrics
- Monitor error rates and response times

### Application Monitoring
- API endpoint health: `/api/schools`
- Database status (when configured)
- User registration/login metrics

## 🔒 Security Considerations

### API Token Permissions
For full functionality, your Cloudflare API token needs:
- `Cloudflare Pages:Edit`
- `Account:Read` 
- `Zone:Read`
- `D1:Edit` (for database operations)

### Environment Security
- Never commit API keys or secrets
- Use Cloudflare environment variables for sensitive data
- Enable proper CORS settings for production

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Database Connection Errors**
   - Check D1 database is created
   - Verify database_id in wrangler.jsonc
   - Ensure migrations are applied

3. **API Token Permissions**
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Ensure token has correct permissions
   - Regenerate if needed

4. **Custom Domain Issues**
   - Check DNS propagation (24-48 hours)
   - Verify domain ownership
   - Ensure SSL certificates are active

## 📈 Performance Optimization

### Cloudflare Features to Enable
- **Auto Minify**: CSS, HTML, JavaScript
- **Brotli Compression**: Faster loading
- **Always Use HTTPS**: Security and SEO
- **Browser Cache TTL**: 4 hours recommended

### Application Optimizations
- Static assets are automatically cached
- API responses cached appropriately
- Database queries optimized with indexes

## 🔄 CI/CD Pipeline

### Automatic Deployments
Once connected to GitHub:
- Push to `main` branch triggers deployment
- Preview deployments for pull requests
- Rollback capabilities in Pages dashboard

### Manual Deployment
```bash
# Build and deploy manually
npm run build
npx wrangler pages deploy dist --project-name school-van-ride
```

## 📞 Support

### Deployment Help
- GitHub Repository: https://github.com/Nagen-bot/my-saferide-school
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Hono Framework: https://hono.dev/

### Application Features
- The app gracefully handles missing database configuration
- Users will see appropriate error messages if database is not set up
- All frontend features work independently of backend