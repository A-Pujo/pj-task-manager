package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger adalah middleware untuk logging semua HTTP requests
// Middleware ini akan mencatat method, path, status code, dan waktu eksekusi
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Catat waktu mulai request
		startTime := time.Now()

		// Ambil path dan method
		path := c.Request.URL.Path
		method := c.Request.Method

		// Process request (lanjut ke handler berikutnya)
		c.Next()

		// Setelah request selesai diproses, hitung durasi
		duration := time.Since(startTime)

		// Get status code dan client IP
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()

		// Log request details
		log.Printf(
			"[%s] %s %s | Status: %d | Duration: %v | IP: %s",
			time.Now().Format("2006-01-02 15:04:05"),
			method,
			path,
			statusCode,
			duration,
			clientIP,
		)
	}
}
