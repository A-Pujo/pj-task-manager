package handlers

import (
	"github.com/A-Pujo/pj-task-manager/backend/internal/config"
	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handle authentication requests (login, register)
type AuthHandler struct {
	repo *repository.PenggunaRepository
	cfg  *config.Config
}

// NewAuthHandler membuat instance baru AuthHandler
func NewAuthHandler(repo *repository.PenggunaRepository, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		repo: repo,
		cfg:  cfg,
	}
}

// LoginRequest adalah struct untuk menerima request login
type LoginRequest struct {
	Email     string `json:"email" binding:"required,email"`
	KataSandi string `json:"kata_sandi" binding:"required"`
}

// LoginResponse adalah struct untuk response login
type LoginResponse struct {
	Token   string          `json:"token"`
	User    models.Pengguna `json:"user"`
	Message string          `json:"message"`
}

// Login handle POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	// Cari user berdasarkan email
	user, err := h.repo.GetByEmailWithPassword(c.Request.Context(), req.Email)
	if err != nil {
		utils.RespondError(c, 401, "Email atau password salah", nil)
		return
	}

	// Cek apakah user aktif
	if !user.IsAktif {
		utils.RespondError(c, 403, "Akun tidak aktif", nil)
		return
	}

	// Validasi password
	if user.KataSandiHash == nil {
		utils.RespondError(c, 401, "Email atau password salah", nil)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(*user.KataSandiHash), []byte(req.KataSandi))
	if err != nil {
		utils.RespondError(c, 401, "Email atau password salah", nil)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(
		user.PenggunaID,
		user.Email,
		user.Peran,
		h.cfg.JWTSecret,
		h.cfg.JWTExpirationHours,
	)
	if err != nil {
		utils.RespondInternalError(c, "Gagal generate token", err)
		return
	}

	// Update terakhir login
	h.repo.UpdateLastLogin(c.Request.Context(), user.PenggunaID)

	// Clear sensitive data sebelum return
	user.KataSandiHash = nil

	// Return success dengan token
	utils.RespondSuccess(c, "Login berhasil", LoginResponse{
		Token:   token,
		User:    *user,
		Message: "Login berhasil",
	})
}

// Register handle POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.PenggunaCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"success": false, "message": "Request body tidak valid", "error": err.Error()})
		return
	}

	// Cek apakah email sudah terdaftar
	existingUser, _ := h.repo.GetByEmail(c.Request.Context(), req.Email)
	if existingUser != nil {
		utils.RespondError(c, 409, "Email sudah terdaftar", nil)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.KataSandi), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "Gagal hash password", "error": err.Error()})
		return
	}

	// Create user
	user, err := h.repo.Create(c.Request.Context(), req, string(hashedPassword))
	if err != nil {
		c.JSON(500, gin.H{"success": false, "message": "Gagal membuat akun", "error": err.Error()})
		return
	}

	// Generate JWT token untuk auto-login setelah register
	token, err := utils.GenerateJWT(
		user.PenggunaID,
		user.Email,
		user.Peran,
		h.cfg.JWTSecret,
		h.cfg.JWTExpirationHours,
	)
	if err != nil {
		utils.RespondInternalError(c, "Gagal generate token", err)
		return
	}

	// Return success dengan token
	utils.RespondCreated(c, "Registrasi berhasil", LoginResponse{
		Token:   token,
		User:    *user,
		Message: "Registrasi berhasil, Anda sudah login",
	})
}
