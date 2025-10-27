package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// SubtugasHandler handle HTTP requests untuk Subtugas
type SubtugasHandler struct {
	repo *repository.SubtugasRepository
}

// NewSubtugasHandler membuat instance baru
func NewSubtugasHandler(repo *repository.SubtugasRepository) *SubtugasHandler {
	return &SubtugasHandler{repo: repo}
}

// GetAll handle GET /api/v1/subtugas
func (h *SubtugasHandler) GetAll(c *gin.Context) {
	subtugass, err := h.repo.GetAll(c.Request.Context())
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil data subtugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data subtugas", gin.H{
		"subtugas": subtugass,
		"total": len(subtugass),
	})
}

// GetByID handle GET /api/v1/subtugas/:id
func (h *SubtugasHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	subtugas, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.RespondNotFound(c, "Subtugas tidak ditemukan")
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data subtugas", gin.H{
		"subtugas": subtugas,
	})
}

// GetByTugasID handle GET /api/v1/tugas/:id/subtugas
func (h *SubtugasHandler) GetByTugasID(c *gin.Context) {
	idStr := c.Param("id")
	tugasID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tugas tidak valid", err)
		return
	}

	subtugass, err := h.repo.GetByTugasID(c.Request.Context(), tugasID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil subtugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil subtugas", gin.H{
		"subtugas": subtugass,
		"total": len(subtugass),
	})
}

// Create handle POST /api/v1/subtugas
func (h *SubtugasHandler) Create(c *gin.Context) {
	var req models.SubtugasCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	subtugas, err := h.repo.Create(c.Request.Context(), req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal membuat subtugas", err)
		return
	}

	utils.RespondCreated(c, "Subtugas berhasil dibuat", subtugas)
}

// Update handle PUT /api/v1/subtugas/:id
func (h *SubtugasHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	var req models.SubtugasUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	subtugas, err := h.repo.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal update subtugas", err)
		return
	}

	utils.RespondSuccess(c, "Subtugas berhasil diupdate", subtugas)
}

// Delete handle DELETE /api/v1/subtugas/:id
func (h *SubtugasHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		utils.RespondInternalError(c, "Gagal menghapus subtugas", err)
		return
	}

	utils.RespondSuccess(c, "Subtugas berhasil dihapus", nil)
}