# gemtalk PLAYGROUND - GitHub 자동 배포 스크립트

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  gemtalk PLAYGROUND - GitHub 배포 도우미" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$gitPath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    $gitPath = "git"
}

# 1. 원격 저장소 URL 입력받기
Write-Host "`n[안내] GitHub(https://github.com/new)에서 생성한 레포지토리 URL을 입력하세요." -ForegroundColor Green
Write-Host "예시: https://github.com/내아이디/gemtalk-playground.git`n" -ForegroundColor Gray

$repoUrl = Read-Host "GitHub 레포지토리 URL 입력"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "`n[오류] URL이 입력되지 않았습니다. 배포를 취소합니다." -ForegroundColor Red
    exit
}

# 2. 원격 저장소 설정 및 푸시
Write-Host "`n[1/3] 원격 저장소(origin) 연결 중..." -ForegroundColor Cyan
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin $repoUrl

Write-Host "`n[2/3] main 브랜치로 GitHub에 푸시 중..." -ForegroundColor Cyan
& $gitPath push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "🎉 GitHub 저장소 푸시 성공!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "`n[GitHub Pages 배포 확인 방법]" -ForegroundColor Yellow
    Write-Host "1. GitHub 레포지토리의 [Settings] -> [Pages] 로 이동"
    Write-Host "2. 'Build and deployment'의 Source를 [GitHub Actions]로 선택"
    Write-Host "3. 잠시 후 상단에 생성되는 무료 웹사이트 링크로 접속하세요!"
} else {
    Write-Host "`n[안내] 푸시 중 인증이 필요할 수 있습니다. GitHub 로그인 창에서 인증을 완료해주세요." -ForegroundColor Yellow
}
