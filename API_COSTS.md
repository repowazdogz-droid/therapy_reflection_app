# API Cost Estimates & Budget Recommendations

## 💰 Recommended Starting Budgets

Based on typical usage (100-500 requests/month):

### **Gemini (Google AI Studio)**
- **Recommended:** $10-20/month
- **Why:** Cheapest option, excellent fallback
- **Cost:** ~$0.075/$0.30 per 1M tokens (input/output)
- **Best for:** Primary model, high volume

### **Claude 3.5 Sonnet (Anthropic)**
- **Recommended:** $25-50/month  
- **Why:** Highest quality, most expensive
- **Cost:** ~$3/$15 per 1M tokens (input/output)
- **Best for:** Premium quality when Gemini fails

### **GPT-4o-mini (OpenAI)**
- **Recommended:** $15-30/month
- **Why:** Good balance of cost/quality
- **Cost:** ~$0.15/$0.60 per 1M tokens (input/output)
- **Best for:** Reliable middle-tier option

### **Grok-3 (X.ai)**
- **Recommended:** $10-20/month
- **Why:** Newer option, competitive pricing
- **Cost:** ~$0.10/$0.30 per 1M tokens (estimated)
- **Best for:** Additional fallback option

## 📊 Cost Per Request Estimate

**Typical request:**
- Input: ~500 tokens (system prompt + user text)
- Output: ~1000 tokens (reflection or summary)

**Cost per request:**
- Gemini: ~$0.0004 per request
- Claude: ~$0.0165 per request  
- GPT-4o-mini: ~$0.0008 per request
- Grok: ~$0.0005 per request

**100 requests/month:**
- Gemini: ~$0.04
- Claude: ~$1.65
- GPT-4o-mini: ~$0.08
- Grok: ~$0.05

**500 requests/month:**
- Gemini: ~$0.20
- Claude: ~$8.25
- GPT-4o-mini: ~$0.40
- Grok: ~$0.25

## 🎯 Recommended Strategy

1. **Start with Gemini** - $10-20 credit (cheapest, good quality)
2. **Add Claude** - $25-50 credit (premium fallback)
3. **Add GPT-4o-mini** - $15-30 credit (reliable middle)
4. **Add Grok** - $10-20 credit (optional extra fallback)

**Total recommended:** $60-120/month for full redundancy

## 📈 Monitoring

Check usage stats:
- Visit: `/api/therapy-ai?stats` (admin only)
- Or check Vercel function logs for detailed breakdown
- Stats show: requests, costs, response times, errors

## ⚠️ Important Notes

- Prices are approximate - check each provider's current pricing
- Costs vary by region and usage volume
- Most providers offer free tier credits to start
- Set up billing alerts on each platform
- The system automatically uses cheapest available model first

