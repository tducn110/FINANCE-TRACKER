# VNUK Anti-Sập Monorepo Deployment Script
# Usage: ./vnuk-deploy.ps1 "Your commit message"

param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

$ErrorActionPreference = "Stop"

try {
    Write-Host "[DEPLOY] Starting VNUK Deployment Workflow..." -ForegroundColor Cyan

    # 1. Save current branch name
    $CurrentBranch = (git branch --show-current)
    Write-Host "[INFO] Current branch: $CurrentBranch"

    # 2. Add and Commit
    Write-Host "[GIT] Adding and committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "$CommitMessage"

    # 3. Transition to dev
    Write-Host "[GIT] Rebasing into dev..." -ForegroundColor Yellow
    git checkout dev
    git rebase $CurrentBranch

    # 4. Transition to main
    Write-Host "[GIT] Merging into main (Linear History)..." -ForegroundColor Yellow
    git checkout main
    git rebase dev

    # 5. Push (Optional, user must do this manually or approve)
    Write-Host "[SUCCESS] Merge sequence complete! History is now linear." -ForegroundColor Green
    Write-Host "[ACTION] ACTION REQUIRED: Run 'git push origin main' to deploy to Vercel." -ForegroundColor Gray

} catch {
    Write-Host "[ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
