package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// PenggunaHandler adalah struct yang handle HTTP requests untuk Pengguna
type PenggunaHandler struct {
	repo *repository.PenggunaRepository
}

// NewPenggunaHandler membuat instance baru
func NewPenggunaHandler(repo *repository.PenggunaRepository) *PenggunaHandler {
	return &PenggunaHandler{repo: repo}
}

// GetAll handle GET /api/v1/pengguna - Get all users
func (h *PenggunaHandler) GetAll(c *gin.Context) {
	penggunas, err := h.repo.GetAll(c.Request.Context())
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil data pengguna", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data pengguna", gin.H{
		"pengguna": penggunas,
		"total":    len(penggunas),
	})
}

// GetByID handle GET /api/v1/pengguna/:id - Get user by ID
func (h *PenggunaHandler) GetByID(c *gin.Context) {
	// Parse ID dari URL parameter
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	pengguna, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.RespondNotFound(c, "Pengguna tidak ditemukan")
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data pengguna", pengguna)
}

// Create handle POST /api/v1/pengguna - Create new user
func (h *PenggunaHandler) Create(c *gin.Context) {
	// Parse request body ke struct
	var req models.PenggunaCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	// Hash password menggunakan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.KataSandi), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondInternalError(c, "Gagal hash password", err)
		return
	}

	// Create user di database
	pengguna, err := h.repo.Create(c.Request.Context(), req, string(hashedPassword))
	if err != nil {
		utils.RespondInternalError(c, "Gagal membuat pengguna", err)
		return
	}

	utils.RespondCreated(c, "Pengguna berhasil dibuat", pengguna)
}

// Update handle PUT /api/v1/pengguna/:id - Update user
func (h *PenggunaHandler) Update(c *gin.Context) {
	// Parse ID
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	// Parse request body
	var req models.PenggunaUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	// Update di database
	pengguna, err := h.repo.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal update pengguna", err)
		return
	}

	utils.RespondSuccess(c, "Pengguna berhasil diupdate", pengguna)
}

// Delete handle DELETE /api/v1/pengguna/:id - Delete user (soft delete)
func (h *PenggunaHandler) Delete(c *gin.Context) {
	// Parse ID
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	// Delete dari database (soft delete)
	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		utils.RespondInternalError(c, "Gagal menghapus pengguna", err)
		return
	}

	utils.RespondSuccess(c, "Pengguna berhasil dihapus", nil)
}
