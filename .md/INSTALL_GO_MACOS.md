# 📦 Instalasi Go di macOS

## Cara Install Go

### Option 1: Menggunakan Homebrew (Recommended)

```bash
# Install Homebrew jika belum ada
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Go
brew install go

# Verifikasi instalasi
go version
```

### Option 2: Download Manual

1. Kunjungi: https://go.dev/dl/
2. Download file `.pkg` untuk macOS
3. Double-click file `.pkg` dan ikuti instalasi
4. Verifikasi:

```bash
go version
```

---

## Setup GOPATH (Optional)

Tambahkan ke `~/.zshrc` atau `~/.bash_profile`:

```bash
# Go environment
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
export PATH=$PATH:/usr/local/go/bin
```

Reload shell:

```bash
source ~/.zshrc
```

---

## Verifikasi Instalasi

```bash
# Check version
go version

# Check environment
go env

# Test create simple program
mkdir -p ~/test-go
cd ~/test-go
go mod init test
```

Create `main.go`:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

Run:

```bash
go run main.go
# Output: Hello, Go!
```

---

## Install Dependencies untuk Project

```bash
cd /Users/djpb/Documents/Pujo/Project/pj-task-manager/backend

# Download semua dependencies dari go.mod
go mod download

# Atau auto-download saat pertama run
go run cmd/api/main.go
```

---

## Troubleshooting

### Go command not found

```bash
# Add to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.zshrc
source ~/.zshrc
```

### Permission denied

```bash
# Fix permissions
sudo chown -R $(whoami) /usr/local/go
```

### Module not found

```bash
# Clean cache and re-download
go clean -modcache
go mod download
```

---

Setelah Go terinstall, Anda bisa menjalankan backend server dengan:

```bash
cd backend
go run cmd/api/main.go
```
