# Apply pending Prisma migrations and regenerate the client. Set DATABASE_URL first.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..
npm run db:deploy
