# GitHub 推送命令

在 GitHub 上新建空仓库：`ai-memory-card-miniapp`，不要勾选自动生成 README / .gitignore / License。

然后在本项目根目录执行：

```bash
git init
git add .
git commit -m "Initial commit: memory card miniapp MVP"
git branch -M main
git remote add origin https://github.com/Steooenwolf-666/ai-memory-card-miniapp.git
git push -u origin main
```

如果你已经建过同名仓库，并且远端不是空仓库，可以使用：

```bash
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Steooenwolf-666/ai-memory-card-miniapp.git
git push -u origin main
```
