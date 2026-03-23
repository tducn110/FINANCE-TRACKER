git init
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/tducn-student/FINAL-PROJECT.git
$ErrorActionPreference = "SilentlyContinue"

try {
    # Commit 1
    git add server/src/model/ server/src/config/ server/database.sql
    git commit -m "feat(db): setup MVC models and ACID transactions Closes #1"
} catch {}

try {
    # Commit 2
    git add server/src/middleware/ server/src/route/authRoutes.js server/src/controller/authController.js
    git commit -m "feat(auth): implement stateless JWT and Joi validation Closes #2"
} catch {}

try {
    # Commit 3
    git add server/src/service/ server/src/controller/financeController.js server/src/constant/
    git commit -m "feat(finance): develop S2S engine and behavioral mascot logic Closes #3"
} catch {}

try {
    # Commit 4 (Finalize)
    git add .
    git commit -m "chore: finalize project structure and documentation"
} catch {}

Write-Host "Git atomic commits completed!"
