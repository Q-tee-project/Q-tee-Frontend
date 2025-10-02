@echo off
echo Fixing encoding issues...
powershell -Command "& { $content = Get-Content 'src/app/dashboard/teacher/page.tsx' -Raw -Encoding UTF8; $content = $content -replace 'marketApi\.getMarketProducts\(\)', 'marketApi.getProducts()'; $content = $content -replace \"'\\?\\�래\\?\\?관\\?\\?\", \"'클래스 관리'\"; $content = $content -replace '// 개별 \\?\\�거 \\?\\�니메이\\?\\?', '// 개별 제거 애니메이션'; [System.IO.File]::WriteAllText('src/app/dashboard/teacher/page.tsx', $content, [System.Text.Encoding]::UTF8) }"
echo Done!
