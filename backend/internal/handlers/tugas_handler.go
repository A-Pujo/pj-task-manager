package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/models"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// TugasHandler handle HTTP requests untuk Tugas
type TugasHandler struct {
	repo *repository.TugasRepository
}

// NewTugasHandler membuat instance baru
func NewTugasHandler(repo *repository.TugasRepository) *TugasHandler {
	return &TugasHandler{repo: repo}
}

// GetAll handle GET /api/v1/tugas
func (h *TugasHandler) GetAll(c *gin.Context) {
	tugass, err := h.repo.GetAll(c.Request.Context())
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil data tugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil data tugas", gin.H{
		"tugas": tugass,
		"total": len(tugass),
	})
}

// GetByID handle GET /api/v1/tugas/:id
func (h *TugasHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	tugas, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		utils.RespondNotFound(c, "Tugas tidak ditemukan")
		return
	}

	// Get assigned users
	assignedUsers, err := h.repo.GetAssignedUsers(c.Request.Context(), id)
	if err != nil {
		// Log error tapi tidak return error ke client
		// Karena tugas tetap bisa ditampilkan tanpa assigned users
		assignedUsers = []models.Pengguna{}
	}

	tugasWithAssignees := models.TugasWithAssignees{
		Tugas:         *tugas,
		AssignedUsers: assignedUsers,
	}

	utils.RespondSuccess(c, "Berhasil mengambil data tugas", tugasWithAssignees)
}

// GetByProyekID handle GET /api/v1/proyek/:id/tugas
func (h *TugasHandler) GetByProyekID(c *gin.Context) {
	idStr := c.Param("id")
	proyekID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID proyek tidak valid", err)
		return
	}

	tugass, err := h.repo.GetByProyekID(c.Request.Context(), proyekID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil tugas proyek", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil tugas proyek", gin.H{
		"tugas": tugass,
		"total": len(tugass),
	})
}

// Create handle POST /api/v1/tugas
func (h *TugasHandler) Create(c *gin.Context) {
	var req models.TugasCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	tugas, err := h.repo.Create(c.Request.Context(), req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal membuat tugas", err)
		return
	}

	utils.RespondCreated(c, "Tugas berhasil dibuat", tugas)
}

// Update handle PUT /api/v1/tugas/:id
func (h *TugasHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	var req models.TugasUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	tugas, err := h.repo.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.RespondInternalError(c, "Gagal update tugas", err)
		return
	}

	utils.RespondSuccess(c, "Tugas berhasil diupdate", tugas)
}

// Delete handle DELETE /api/v1/tugas/:id
func (h *TugasHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tidak valid", err)
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		utils.RespondInternalError(c, "Gagal menghapus tugas", err)
		return
	}

	utils.RespondSuccess(c, "Tugas berhasil dihapus", nil)
}

// AssignUser handle POST /api/v1/tugas/:id/assign
func (h *TugasHandler) AssignUser(c *gin.Context) {
	idStr := c.Param("id")
	tugasID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tugas tidak valid", err)
		return
	}

	// Parse request body untuk pengguna_id
	var req struct {
		PenggunaID int `json:"pengguna_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Request body tidak valid", err)
		return
	}

	if err := h.repo.AssignUser(c.Request.Context(), tugasID, req.PenggunaID); err != nil {
		utils.RespondInternalError(c, "Gagal assign user ke tugas", err)
		return
	}

	utils.RespondCreated(c, "User berhasil di-assign ke tugas", nil)
}

// UnassignUser handle DELETE /api/v1/tugas/:id/assign/:user_id
func (h *TugasHandler) UnassignUser(c *gin.Context) {
	tugasIDStr := c.Param("id")
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID tugas tidak valid", err)
		return
	}

	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "ID user tidak valid", err)
		return
	}

	if err := h.repo.UnassignUser(c.Request.Context(), tugasID, userID); err != nil {
		utils.RespondInternalError(c, "Gagal unassign user", err)
		return
	}

	utils.RespondSuccess(c, "User berhasil di-unassign dari tugas", nil)
}
