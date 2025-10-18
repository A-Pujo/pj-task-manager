package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Recovery adalah middleware untuk menangkap panic dan mencegah server crash
// Jika ada panic, akan return error 500 ke client
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log panic error
				log.Printf("❌ PANIC: %v", err)

				// Return 500 Internal Server Error ke client
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Internal server error",
					"error":   "Terjadi kesalahan pada server",
				})

				// Abort request
				c.Abort()
			}
		}()

		// Process request
		c.Next()
	}
}
