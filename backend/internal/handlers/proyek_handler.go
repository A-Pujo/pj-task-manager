package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// ProyekHandler handle HTTP requests untuk Proyek
type ProyekHandler struct {
	repo *repository.ProyekRepository
}

// NewProyekHandler membuat instance baru
func NewProyekHandler(repo *repository.ProyekRepository) *ProyekHandler {
	return &ProyekHandler{repo: repo}
}

// GetAll handle GET /api/v1/proyek
func (h *ProyekHandler) GetAll(c *gin.Context) {
	proyeks, err := h.repo.GetAll(c.Request.Context())
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil data proyek", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data proyek", gin.H{
		"proyek": proyeks,
		"total":  len(proyeks),
	})
}

// GetByID handle GET /api/v1/proyek/:id
func (h *ProyekHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	proyek, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.RespondNotFound(c, "Proyek tidak ditemukan")
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data proyek", proyek)
}

// Create handle POST /api/v1/proyek
func (h *ProyekHandler) Create(c *gin.Context) {
	var req models.ProyekCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	proyek, err := h.repo.Create(c.Request.Context(), req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal membuat proyek", err)
		return
	}

	utils.RespondCreated(c, "Proyek berhasil dibuat", proyek)
}

// Update handle PUT /api/v1/proyek/:id
func (h *ProyekHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	var req models.ProyekUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	proyek, err := h.repo.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal update proyek", err)
		return
	}

	utils.RespondSuccess(c, "Proyek berhasil diupdate", proyek)
}

// Delete handle DELETE /api/v1/proyek/:id
func (h *ProyekHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		utils.RespondInternalError(c, "Gagal menghapus proyek", err)
		return
	}

	utils.RespondSuccess(c, "Proyek berhasil dihapus", nil)
}
