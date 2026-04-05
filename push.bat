@echo off
git commit -m "Studynex V6.0 Production Release"
git branch -M main
git remote add origin https://github.com/tanisksahu/Studynex.git
git push -u origin main
