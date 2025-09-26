# GitHub Security Configuration Guide

This guide provides step-by-step instructions for configuring security settings for both the public and private repositories.

## 🔒 PRIVATE REPOSITORY: `stembot-mvp-core`

### 1. Repository Creation & Basic Settings

1. **Create Private Repository**:
   ```bash
   # Navigate to GitHub and create new repository
   Name: stembot-mvp-core
   Visibility: Private
   License: None (Proprietary)
   ```

2. **Add Remote and Push**:
   ```bash
   cd stembot-mvp-core
   git remote add origin https://github.com/yourusername/stembot-mvp-core.git
   git branch -M main
   git push -u origin main
   ```

### 2. Security Settings Configuration

#### Repository Settings → General
- ✅ Repository visibility: **Private**
- ✅ Restrict pushes that create files larger than 100 MB
- ✅ Block creation of public codespaces

#### Repository Settings → Manage access
- ✅ Add only required team members
- ✅ Grant minimum necessary permissions:
  - Core developers: **Write**
  - Security team: **Admin**
  - External contractors: **Read** (if needed)

#### Repository Settings → Branches
```yaml
Branch protection rules for 'main':
✅ Require a pull request before merging
  ✅ Require approvals: 2
  ✅ Dismiss stale PR approvals when new commits are pushed
  ✅ Require review from code owners
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Status checks: "Security Scanning", "Dependency Review"
✅ Require conversation resolution before merging
✅ Require signed commits
✅ Require linear history
✅ Include administrators
✅ Restrict pushes that create files larger than 100MB
```

#### Repository Settings → Code security and analysis
```yaml
✅ Private vulnerability reporting: Enabled
✅ Dependency graph: Enabled
✅ Dependabot alerts: Enabled
✅ Dependabot security updates: Enabled
✅ Dependabot version updates: Enabled (monthly)
✅ Secret scanning: Enabled
✅ Push protection: Enabled
✅ Code scanning: Enabled (CodeQL analysis)
```

### 3. Dependabot Configuration

Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
    assignees:
      - "devops-lead"
    commit-message:
      prefix: "security"
      include: "scope"
```

### 4. Webhook Configuration (Optional)

For security monitoring:
```yaml
Payload URL: https://your-monitoring-system.com/github-webhook
Content type: application/json
Secret: [Generate secure webhook secret]
Events:
  ✅ Member
  ✅ Push
  ✅ Pull request
  ✅ Repository
  ✅ Security advisory
```

## 🌍 PUBLIC REPOSITORY: `stembot_v1`

### 1. Repository Settings

#### Repository Settings → General
- ✅ Repository visibility: **Public**
- ✅ Features:
  - ✅ Issues
  - ✅ Projects
  - ✅ Wiki (if needed)
  - ✅ Sponsorships (if applicable)
- ✅ Restrict pushes that create files larger than 100 MB

#### Repository Settings → Manage access
- ✅ Base permissions: **Read**
- ✅ Allow merge commits: ✅
- ✅ Allow squash merging: ✅
- ✅ Allow rebase merging: ✅
- ✅ Always suggest updating pull request branches: ✅
- ✅ Automatically delete head branches: ✅

#### Repository Settings → Branches
```yaml
Branch protection rules for 'main':
✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale PR approvals when new commits are pushed
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Status checks: "CI/CD", "Tests"
✅ Require conversation resolution before merging
✅ Include administrators
```

#### Repository Settings → Code security and analysis
```yaml
✅ Dependency graph: Enabled
✅ Dependabot alerts: Enabled
✅ Dependabot security updates: Enabled
✅ Secret scanning: Enabled
✅ Push protection: Enabled
```

### 2. Issue & PR Templates

Create `.github/ISSUE_TEMPLATE/security.yml`:
```yaml
name: Security Vulnerability Report
description: Report a security vulnerability
title: "[SECURITY] "
labels: ["security", "bug"]
assignees: ["security-team"]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a security vulnerability. We take security seriously.
  - type: textarea
    id: vulnerability
    attributes:
      label: Vulnerability Description
      description: Describe the security issue you found
      placeholder: Please provide details about the vulnerability
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce this issue?
    validations:
      required: true
  - type: textarea
    id: impact
    attributes:
      label: Potential Impact
      description: What could an attacker do with this vulnerability?
    validations:
      required: true
```

## 🔐 Security Checklist

### For Private Repository (`stembot-mvp-core`)
- [ ] Repository set to private
- [ ] Branch protection rules configured
- [ ] Required reviewers set up
- [ ] Secret scanning enabled
- [ ] Dependabot configured
- [ ] Code owners file created
- [ ] Security workflows active
- [ ] Webhook monitoring set up
- [ ] Access permissions reviewed
- [ ] Two-factor authentication enforced

### For Public Repository (`stembot_v1`)
- [ ] Comprehensive .gitignore implemented
- [ ] Security.md created
- [ ] Secret scanning enabled
- [ ] Dependabot alerts active
- [ ] Issue templates for security
- [ ] Branch protection for main
- [ ] No sensitive data in history
- [ ] Clean repository structure
- [ ] Documentation updated
- [ ] CI/CD security checks

## 🚨 Post-Configuration Actions

### Immediate Actions
1. **Verify Secret Scanning**: Push a test file with fake credentials to ensure detection
2. **Test Branch Protection**: Create a PR without required reviews to ensure blocking
3. **Review Access Logs**: Check who has access to both repositories
4. **Audit Dependencies**: Run security scans on all packages

### Ongoing Monitoring
1. **Weekly Security Reviews**: Check alerts and vulnerabilities
2. **Monthly Access Audits**: Review who has access to private repo
3. **Quarterly Security Updates**: Update dependencies and configurations
4. **Annual Security Assessment**: Full security review and penetration testing

## 📞 Emergency Procedures

### If Secrets Are Exposed
1. **Immediately** revoke the exposed credentials
2. Generate new secrets and update all systems
3. Review git history for other potential exposures
4. Notify security team within 1 hour
5. Document incident for future prevention

### If Private Code Is Exposed
1. Assess scope of exposure immediately
2. Contact legal team if customer data involved
3. Rotate any potentially compromised secrets
4. Review and strengthen security measures
5. Notify stakeholders as required

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential.