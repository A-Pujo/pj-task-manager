package handlers

import (
	"strconv"

	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/A-Pujo/pj-task-manager/backend/internal/utils"
	"github.com/gin-gonic/gin"
)

// PenugasanTugasHandler handle HTTP requests untuk PenugasanTugas
type PenugasanTugasHandler struct {
	repo *repository.PenugasanTugasRepository
}

// NewPenugasanTugasHandler membuat instance baru
func NewPenugasanTugasHandler(repo *repository.PenugasanTugasRepository) *PenugasanTugasHandler {
	return &PenugasanTugasHandler{repo: repo}
}

// AssignUser handle POST /api/v1/tugas/:id/assign/:userId
func (h *PenugasanTugasHandler) AssignUser(c *gin.Context) {
	tugasIDStr := c.Param("id")
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "Tugas ID tidak valid", err)
		return
	}

	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "User ID tidak valid", err)
		return
	}

	err = h.repo.AssignUser(c.Request.Context(), tugasID, userID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal assign user ke tugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil assign user ke tugas", nil)
}

// UnassignUser handle DELETE /api/v1/tugas/:id/assign/:userId
func (h *PenugasanTugasHandler) UnassignUser(c *gin.Context) {
	tugasIDStr := c.Param("id")
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "Tugas ID tidak valid", err)
		return
	}

	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "User ID tidak valid", err)
		return
	}

	err = h.repo.UnassignUser(c.Request.Context(), tugasID, userID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal unassign user dari tugas", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil unassign user dari tugas", nil)
}

// GetAssignedUsers handle GET /api/v1/tugas/:id/assigned
func (h *PenugasanTugasHandler) GetAssignedUsers(c *gin.Context) {
	tugasIDStr := c.Param("id")
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "Tugas ID tidak valid", err)
		return
	}

	users, err := h.repo.GetAssignedUsers(c.Request.Context(), tugasID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil assigned users", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil assigned users", gin.H{
		"users": users,
		"total": len(users),
	})
}

// AssignMultipleUsers handle POST /api/v1/tugas/:id/assign-multiple
func (h *PenugasanTugasHandler) AssignMultipleUsers(c *gin.Context) {
	tugasIDStr := c.Param("id")
	tugasID, err := strconv.Atoi(tugasIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "Tugas ID tidak valid", err)
		return
	}

	var req struct {
		PenggunaIDs []int `json:"pengguna_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, "Data request tidak valid", err)
		return
	}

	err = h.repo.AssignMultipleUsers(c.Request.Context(), tugasID, req.PenggunaIDs)
	if err != nil {
		utils.RespondInternalError(c, "Gagal assign multiple users", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil assign multiple users ke tugas", nil)
}

// GetUserTasks handle GET /api/v1/pengguna/:id/tugas
func (h *PenugasanTugasHandler) GetUserTasks(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondBadRequest(c, "User ID tidak valid", err)
		return
	}

	tasks, err := h.repo.GetUserTasks(c.Request.Context(), userID)
	if err != nil {
		utils.RespondInternalError(c, "Gagal mengambil user tasks", err)
		return
	}

	utils.RespondSuccess(c, "Berhasil mengambil user tasks", gin.H{
		"tugas": tasks,
		"total": len(tasks),
	})
}
