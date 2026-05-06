// All prices verified against official pricing pages as of May 2026
// Sources in PRICING_DATA.md

export interface ToolPricing {
  name: string;
  plans: Plan[];
  alternatives?: Alternative[];
}

export interface Plan {
  name: string;
  monthlyPricePerSeat: number;
  minSeats?: number;
  features: string[];
  url: string;
}

export interface Alternative {
  name: string;
  url: string;
  monthlyPricePerSeat: number;
  bestFor: string[];
  savingsNote: string;
}

export const TOOLS: ToolPricing[] = [
  {
    name: "Cursor",
    plans: [
      {
        name: "Hobby",
        monthlyPricePerSeat: 0,
        features: ["2000 completions/month", "50 slow premium requests"],
        url: "https://cursor.sh/pricing"
      },
      {
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["Unlimited completions", "500 fast premium requests/month", "10 o1-mini uses/day"],
        url: "https://cursor.sh/pricing"
      },
      {
        name: "Business",
        monthlyPricePerSeat: 40,
        features: ["Everything in Pro", "Admin dashboard", "SSO", "Privacy mode"],
        url: "https://cursor.sh/pricing"
      },
      {
        name: "Enterprise",
        monthlyPricePerSeat: 60,
        features: ["Custom models", "On-premises deployment", "Dedicated support"],
        url: "https://cursor.sh/pricing"
      }
    ],
    alternatives: [
      {
        name: "Windsurf",
        url: "https://codeium.com/windsurf/pricing",
        monthlyPricePerSeat: 15,
        bestFor: ["coding"],
        savingsNote: "Similar AI coding capabilities at 25% less than Cursor Pro"
      }
    ]
  },
  {
    name: "GitHub Copilot",
    plans: [
      {
        name: "Individual",
        monthlyPricePerSeat: 10,
        features: ["Code completions", "Chat in IDE", "CLI access"],
        url: "https://github.com/features/copilot/plans"
      },
      {
        name: "Business",
        monthlyPricePerSeat: 19,
        features: ["Everything in Individual", "Organization policies", "IP indemnity"],
        url: "https://github.com/features/copilot/plans"
      },
      {
        name: "Enterprise",
        monthlyPricePerSeat: 39,
        features: ["Everything in Business", "Custom models", "Knowledge bases"],
        url: "https://github.com/features/copilot/plans"
      }
    ]
  },
  {
    name: "Claude",
    plans: [
      {
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Limited messages", "Claude 3.5 Sonnet access"],
        url: "https://www.anthropic.com/pricing"
      },
      {
        name: "Pro",
        monthlyPricePerSeat: 20,
        features: ["5x more usage", "Priority access", "Projects"],
        url: "https://www.anthropic.com/pricing"
      },
      {
        name: "Max",
        monthlyPricePerSeat: 100,
        features: ["Highest usage limits", "Extended context"],
        url: "https://www.anthropic.com/pricing"
      },
      {
        name: "Team",
        monthlyPricePerSeat: 30,
        features: ["Everything in Pro", "Admin tools", "Higher rate limits", "Min 5 seats"],
        url: "https://www.anthropic.com/pricing"
      },
      {
        name: "Enterprise",
        monthlyPricePerSeat: 45,
        features: ["Custom models", "SSO", "Audit logs"],
        url: "https://www.anthropic.com/pricing"
      }
    ]
  },
  {
    name: "ChatGPT",
    plans: [
      {
        name: "Plus",
        monthlyPricePerSeat: 20,
        features: ["GPT-4 access", "DALL-E", "Data analysis"],
        url: "https://openai.com/chatgpt/pricing"
      },
      {
        name: "Team",
        monthlyPricePerSeat: 30,
        features: ["Everything in Plus", "Higher limits", "Shared workspaces", "Min 2 seats"],
        url: "https://openai.com/chatgpt/pricing"
      },
      {
        name: "Enterprise",
        monthlyPricePerSeat: 60,
        features: ["Unlimited high-speed access", "Admin console", "SSO"],
        url: "https://openai.com/chatgpt/pricing"
      }
    ]
  },
  {
    name: "Gemini",
    plans: [
      {
        name: "Pro",
        monthlyPricePerSeat: 0,
        features: ["Basic Gemini access", "Google Workspace integration"],
        url: "https://one.google.com/about/ai-premium"
      },
      {
        name: "Ultra",
        monthlyPricePerSeat: 20,
        features: ["Gemini Ultra model", "2TB Google One storage", "Priority support"],
        url: "https://one.google.com/about/ai-premium"
      }
    ]
  },
  {
    name: "Windsurf",
    plans: [
      {
        name: "Free",
        monthlyPricePerSeat: 0,
        features: ["Basic autocomplete", "Limited chat"],
        url: "https://codeium.com/windsurf/pricing"
      },
      {
        name: "Pro",
        monthlyPricePerSeat: 15,
        features: ["Unlimited autocomplete", "Advanced chat", "Cascade AI"],
        url: "https://codeium.com/windsurf/pricing"
      },
      {
        name: "Teams",
        monthlyPricePerSeat: 23,
        features: ["Everything in Pro", "Admin dashboard", "Analytics", "Min 3 seats"],
        url: "https://codeium.com/windsurf/pricing"
      }
    ]
  }
];

// API-direct pricing (usage-based — these are approximate monthly averages per seat)
export const API_PRICING = {
  "Anthropic API Direct": {
    name: "Anthropic API Direct",
    estimatedMonthlyPerSeat: 50, // moderate usage estimate
    url: "https://www.anthropic.com/pricing",
    alternatives: [
      {
        name: "OpenAI API",
        estimatedMonthlyPerSeat: 40,
        url: "https://openai.com/pricing",
        bestFor: ["coding", "data", "writing"],
        savingsNote: "OpenAI API can be 20-30% cheaper for equivalent workloads"
      }
    ]
  },
  "OpenAI API Direct": {
    name: "OpenAI API Direct",
    estimatedMonthlyPerSeat: 50,
    url: "https://openai.com/pricing",
    alternatives: [
      {
        name: "Anthropic API",
        estimatedMonthlyPerSeat: 45,
        url: "https://www.anthropic.com/pricing",
        bestFor: ["writing", "research"],
        savingsNote: "Claude API can be more cost-effective for long-form content"
      }
    ]
  }
};