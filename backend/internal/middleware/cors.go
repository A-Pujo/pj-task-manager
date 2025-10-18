package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS middleware untuk mengizinkan frontend mengakses backend
// Ini penting untuk aplikasi web yang frontend dan backend beda domain/port
func CORS() gin.HandlerFunc {
	config := cors.Config{
		// AllowOrigins adalah list domain yang diizinkan akses
		// Untuk development, kita allow localhost dengan port berbeda
		AllowOrigins: []string{
			"http://localhost:3000",  // React dev server
			"http://localhost:5173",  // Vite dev server
			"http://localhost:8080",
			"http://localhost:5577",
		},

		// AllowMethods adalah HTTP methods yang diizinkan
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},

		// AllowHeaders adalah headers yang diizinkan dari frontend
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept",
			"Authorization",
			"X-Requested-With",
		},

		// ExposeHeaders adalah headers yang bisa dibaca oleh frontend
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
		},

		// AllowCredentials mengizinkan cookies dan credentials
		AllowCredentials: true,

		// MaxAge adalah waktu cache preflight request (dalam detik)
		MaxAge: 12 * 3600, // 12 jam
	}

	return cors.New(config)
}
