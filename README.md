# StemBot Research Mentor - UI Components

> **Open-source frontend components for the next generation of academic research mentoring**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🎯 **About StemBot**

StemBot is revolutionizing how university STEM students approach research projects. Instead of struggling alone with vague ideas and overwhelming literature, students get an AI research mentor that guides them through every step—from refining research questions to presenting final results.

**This repository contains the open-source UI components** that power our research mentoring platform, designed specifically for the academic environment with clean, professional, and accessible interfaces.

---

## 🌟 **What This Repository Offers**

### **✅ Public Components (MIT Licensed)**
- **🎨 Academic-themed UI components** built with React & TypeScript
- **📱 Responsive layouts** optimized for university environments
- **♿ Accessibility-first design** following WCAG 2.1 guidelines
- **🎓 Research-focused interfaces** for project management and navigation
- **🌍 Internationalization ready** (English/Dutch support)
- **⚡ Modern tech stack** with Next.js 13+, Tailwind CSS, and TypeScript

### **🔒 What Stays Proprietary**
Our core research mentoring capabilities remain private to ensure the best possible experience:
- ❌ **AI research mentoring system** (question refinement, methodology guidance)
- ❌ **Memory and session continuity** (cross-session project understanding)
- ❌ **Document processing** (PDF analysis, data interpretation, literature review)
- ❌ **Backend infrastructure** (APIs, database, authentication)
- ❌ **Research intelligence** (gap analysis, methodology validation)

---

## 🚀 **Quick Start**

### **Prerequisites**
```bash
Node.js 18.0+ and npm
Git
VS Code (recommended)
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/[your-username]/stembot-research-mentor.git

# Navigate to project
cd stembot-research-mentor

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Development**
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

Visit `http://localhost:3000` to see the academic-themed interface in action!

---

## 🤝 **Contributing to StemBot**

We believe the best educational tools are built by the community they serve. Whether you're a developer, designer, or student, your contributions can help millions of STEM students worldwide.

### **🎯 What We're Looking For**

#### **High Priority Contributions:**
- **🌍 Dutch translations** for Netherlands universities
- **♿ Accessibility improvements** (screen readers, keyboard navigation, color contrast)
- **📱 Mobile responsiveness** enhancements for tablets and phones
- **🎨 UI polish** and visual design improvements

#### **Welcome Contributions:**
- **🐛 Bug fixes** in frontend components
- **📚 Documentation** improvements and examples
- **🔧 Developer experience** enhancements
- **✨ New UI components** following our academic theme

#### **🚫 What We Don't Accept**
- Backend or API implementations
- AI or machine learning code
- Database or authentication logic
- Business logic or proprietary features
- Attempts to replicate core platform functionality

### **🛠 Development Guidelines**

#### **Code Standards**
- **TypeScript** for all new components with proper type definitions
- **Tailwind CSS** following our academic theme utilities
- **Accessible HTML** with proper ARIA labels and semantic markup
- **Component documentation** with JSDoc comments

#### **Academic Theme Principles**
```css
/* Our design system focuses on: */
- Clean, distraction-free interfaces
- Professional academic credibility
- Clear information hierarchy
- Subtle, purposeful interactions
- High contrast for accessibility
```

#### **Component Structure**
```typescript
interface ComponentProps {
  // Clear prop definitions with JSDoc
  /** Description of the prop */
  title: string;
  /** Optional props with defaults */
  variant?: 'primary' | 'secondary';
}

/**
 * ComponentName - Brief description
 * @param props - Component props
 */
export const ComponentName: React.FC<ComponentProps> = ({ 
  title, 
  variant = 'primary' 
}) => {
  return (
    <div className="academic-theme-classes">
      {/* Accessible, semantic markup */}
    </div>
  );
};
```

### **📝 Contribution Process**

1. **🍴 Fork** this repository
2. **🌿 Create** a feature branch: `git checkout -b feature/ui-improvement`
3. **💻 Develop** following our guidelines
4. **🧪 Test** across devices and browsers
5. **📖 Document** your changes
6. **🔄 Submit** a pull request with clear description

### **🎁 Contributor Rewards**

We believe in recognizing valuable contributions:

| Contribution Level | Reward |
|-------------------|--------|
| **First merged PR** | 🏆 Contributor badge + Welcome package |
| **3+ merged PRs** | 🎁 **Free Hobby tier** (€15/month value) for 3 months |
| **10+ merged PRs** | 💎 **Free Pro tier** (€100/month value) for 6 months |
| **Top contributors** | 🌟 Direct feedback channel + Annual recognition |

---

## 🏛 **Built for Universities**

### **🇳🇱 Netherlands Focus**
StemBot was born from the needs of Dutch universities. We're specifically looking for:
- **Dutch language translations** for UI elements
- **University-specific customizations** for TU Delft, University of Utrecht, etc.
- **Academic workflow improvements** based on European research standards

### **🎓 Academic Context**
Our interfaces are designed for:
- **Research project management** (bachelor/master thesis, capstone projects)
- **Collaborative academic work** (supervisor meetings, peer review)
- **Long-term research tracking** (semester/year-long projects)
- **Academic presentation standards** (thesis formatting, conference presentations)

---

## 🏗 **Architecture & Tech Stack**

### **Frontend Stack**
```typescript
Framework: Next.js 13+ (App Router)
Language: TypeScript 5.0+
Styling: Tailwind CSS 3.0+
Icons: Lucide React
Fonts: Inter (academic readability)
```

### **Development Tools**
```bash
Linting: ESLint + Prettier
Type Checking: TypeScript strict mode
Testing: Jest + React Testing Library
Accessibility: axe-core testing
```

### **Component Architecture**
```
src/
├── app/                    # Next.js 13 app directory
│   ├── (auth)/            # Authentication layouts
│   ├── dashboard/         # Main dashboard
│   └── globals.css        # Academic theme
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Navigation, headers
│   ├── dashboard/         # Dashboard-specific
│   └── forms/             # Form components
└── types/                 # TypeScript definitions
```

---

## 🌍 **Community & Support**

### **🗣 Community Channels**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Email**: contribute@stembot.app for contribution questions

### **📧 Stay Updated**
- **Newsletter**: Monthly contributor updates
- **Releases**: New component announcements
- **Beta Access**: Early preview of new features

### **❓ Getting Help**

#### **For UI/Component Questions:**
- Open a GitHub issue with the `question` label
- Check our component documentation
- Browse existing discussions

#### **For Platform Features:**
- Visit [stembot.app](https://stembot.app) for platform support
- Email support@stembot.app for account issues
- Platform features are not covered in this repository

---

## 📊 **The Impact You're Making**

### **🎯 Our Mission**
Every UI improvement you contribute helps thousands of STEM students:
- **Reduce research project abandonment** from 40% to under 10%
- **Improve research question quality** through better user experience
- **Make academic tools accessible** to students with disabilities
- **Support international students** through multi-language interfaces

### **📈 Current Reach**
- **Universities**: Partnered with 5+ Netherlands institutions
- **Students**: 1,000+ beta users across Europe
- **Projects**: 500+ research projects guided to completion
- **Impact**: 85% of students report improved research confidence

---

## 🔒 **Security & Privacy**

### **🛡 Repository Security**
- All code is reviewed before merging
- Automated security scanning enabled
- No API keys or secrets in public code
- Regular dependency updates via Dependabot

### **🔐 Reporting Security Issues**
If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. **Email** security@stembot.app with details
3. **Include** steps to reproduce (if applicable)

We'll respond within 48 hours and work with you to resolve the issue.

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - You are free to:
✅ Use commercially
✅ Modify and distribute
✅ Use privately
✅ Include in larger projects

With the requirement to:
📄 Include license and copyright notice
```

### **Trademark Notice**
"StemBot" is a trademark of StemBot Research Mentor. The MIT license covers the code in this repository but does not grant rights to use the StemBot name or branding.

---

## 🚀 **About the Full Platform**

This repository showcases our frontend capabilities, but the complete StemBot experience includes:

- **🧠 AI Research Mentor**: Socratic questioning and methodology guidance
- **📚 Literature Review Assistant**: Automated source analysis and gap identification  
- **🔬 Methodology Validation**: Statistical planning and experimental design feedback
- **✍️ Academic Writing Support**: Structure guidance and citation management
- **💾 Project Memory**: Cross-session continuity and research progression tracking

**Ready to experience the full platform?**
Visit [stembot.app](https://stembot.app) for free tier access.

---

## 🙋‍♀️ **Credits & Acknowledgments**

### **Core Team**
- **Development**: StemBot Research Team
- **Design**: Academic UX specialists
- **Research**: University of Netherlands partnerships

### **Contributors**
A special thanks to all our open-source contributors! See our [Contributors](https://github.com/[username]/stembot-research-mentor/graphs/contributors) page for the full list.

### **Universities**
Thank you to our partner institutions for guidance and feedback:
- TU Delft
- University of Utrecht  
- [Your university here?]

---

**🌟 Star this repository if you believe in improving STEM education!**

**🤝 Ready to contribute? Check out our [Good First Issues](https://github.com/[username]/stembot-research-mentor/labels/good%20first%20issue)**