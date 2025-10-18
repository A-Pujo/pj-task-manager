package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SuccessResponse adalah struct untuk standardized success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// ErrorResponse adalah struct untuk standardized error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// RespondSuccess mengirim success response dengan status 200
func RespondSuccess(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// RespondCreated mengirim success response dengan status 201 (Created)
func RespondCreated(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// RespondError mengirim error response dengan status code tertentu
func RespondError(c *gin.Context, statusCode int, message string, err error) {
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}

	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Message: message,
		Error:   errMsg,
	})
}

// RespondBadRequest mengirim error response 400 (Bad Request)
func RespondBadRequest(c *gin.Context, message string, err error) {
	RespondError(c, http.StatusBadRequest, message, err)
}

// RespondNotFound mengirim error response 404 (Not Found)
func RespondNotFound(c *gin.Context, message string) {
	RespondError(c, http.StatusNotFound, message, nil)
}

// RespondInternalError mengirim error response 500 (Internal Server Error)
func RespondInternalError(c *gin.Context, message string, err error) {
	RespondError(c, http.StatusInternalServerError, message, err)
}
