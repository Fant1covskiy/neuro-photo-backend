[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

$categories = @(
    @{name="Аниме"; order=1; is_active=$true},
    @{name="Портреты"; order=2; is_active=$true},
    @{name="Арт"; order=3; is_active=$true}
)

foreach ($cat in $categories) {
    $body = $cat | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "http://localhost:3000/categories" -Method Post -Headers @{"Content-Type"="application/json; charset=utf-8"} -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
}

$styles = @(
    @{name="Стиль Miyazaki"; description="Стиль японского аниме от Хаяо Миядзаки"; category_id=1; price=2990; tags=@("аниме","miyazaki","гибли"); is_active=$true},
    @{name="Студийное фото"; description="Профессиональное студийное фото"; category_id=2; price=1990; tags=@("фото","студия"); is_active=$true},
    @{name="Акварель"; description="Рисунок акварелью"; category_id=3; price=2490; tags=@("арт","акварель"); is_active=$true},
    @{name="Cyberpunk"; description="Киберпанк стиль"; category_id=3; price=3490; tags=@("cyberpunk","sci-fi"); is_active=$true},
    @{name="Винтаж"; description="Винтажное фото"; category_id=2; price=1790; tags=@("винтаж","ретро"); is_active=$true}
)

foreach ($style in $styles) {
    $body = $style | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "http://localhost:3000/styles" -Method Post -Headers @{"Content-Type"="application/json; charset=utf-8"} -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
}

Write-Host "Данные добавлены успешно!"
