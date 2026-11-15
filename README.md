# logo

سكل شخصي لـ Codex يولّد بطاقة PNG مستقلة لكل شعار. القياس الافتراضي 2400 × 1600، بخلفية داكنة وشعار رصاصي واسم إنجليزي بخط Alexandria.

![بطاقة Steam](assets/reference-steam.png)

## التثبيت على Windows

شغّل الأوامر التالية في PowerShell على جهاز فيه Git وNode.js 22.12 أو أحدث.

```powershell
$skills = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $HOME '.codex/skills' }
$logo = Join-Path $skills 'logo'
git clone https://github.com/otakuiv3/logo.git $logo
npm ci --prefix $logo
```

مثال في المحادثة — `$logo دزلي بطاقة Discord`
