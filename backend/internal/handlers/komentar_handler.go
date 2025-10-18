package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// KomentarHandler handle HTTP requests untuk Komentar
type KomentarHandler struct {
	repo *repository.KomentarRepository
}

// NewKomentarHandler membuat instance baru
func NewKomentarHandler(repo *repository.KomentarRepository) *KomentarHandler {
	return &KomentarHandler{repo: repo}
}

// GetAll handle GET /api/v1/komentar
func (h *KomentarHandler) GetAll(c *gin.Context) {
	komentars, err := h.repo.GetAll(c.Request.Context())
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil data komentar", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data komentar", gin.H{
		"komentar": komentars,
		"total":    len(komentars),
	})
}

// GetByTugasID handle GET /api/v1/tugas/:id/komentar
func (h *KomentarHandler) GetByTugasID(c *gin.Context) {
	idStr := c.Param("id")
	tugasID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tugas tidak valid", err)
		return
	}

	komentars, err := h.repo.GetByTugasID(c.Request.Context(), tugasID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil komentar tugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil komentar tugas", gin.H{
		"komentar": komentars,
		"total":    len(komentars),
	})
}

// GetByProyekID handle GET /api/v1/proyek/:id/komentar
func (h *KomentarHandler) GetByProyekID(c *gin.Context) {
	idStr := c.Param("id")
	proyekID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID proyek tidak valid", err)
		return
	}

	komentars, err := h.repo.GetByProyekID(c.Request.Context(), proyekID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil komentar proyek", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil komentar proyek", gin.H{
		"komentar": komentars,
		"total":    len(komentars),
	})
}

// Create handle POST /api/v1/komentar
func (h *KomentarHandler) Create(c *gin.Context) {
	var req models.KomentarCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	komentar, err := h.repo.Create(c.Request.Context(), req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal membuat komentar", err)
		return
	}

	utils.RespondCreated(c, "Komentar berhasil dibuat", komentar)
}

// Delete handle DELETE /api/v1/komentar/:id
func (h *KomentarHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		utils.RespondInternalError(c, "Gagal menghapus komentar", err)
		return
	}

	utils.RespondSuccess(c, "Komentar berhasil dihapus", nil)
}
