package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/A-Pujo/pj-task-manager/backend/internal/config"
	"github.com/A-Pujo/pj-task-manager/backend/internal/database"
	"github.com/A-Pujo/pj-task-manager/backend/internal/handlers"
	"github.com/A-Pujo/pj-task-manager/backend/internal/middleware"
	"github.com/A-Pujo/pj-task-manager/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. LOAD CONFIG dari .env
	log.Println("📝 Loading configuration...")
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}
	log.Printf("✅ Config loaded. Server will run on port %s", cfg.Port)

	// 2. CONNECT KE DATABASE
	log.Println("🔌 Connecting to database...")
	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect database: %v", err)
	}
	defer db.Close()
	log.Println("✅ Database connected successfully")

	// 3. INITIALIZE REPOSITORIES (Data Access Layer)
	penggunaRepo := repository.NewPenggunaRepository(db.Pool)
	proyekRepo := repository.NewProyekRepository(db.Pool)
	tugasRepo := repository.NewTugasRepository(db.Pool)
	komentarRepo := repository.NewKomentarRepository(db.Pool)
	penugasanRepo := repository.NewPenugasanTugasRepository(db.Pool)
	log.Println("✅ Repositories initialized")

	// 4. INITIALIZE HANDLERS (Controllers)
	penggunaHandler := handlers.NewPenggunaHandler(penggunaRepo)
	proyekHandler := handlers.NewProyekHandler(proyekRepo)
	tugasHandler := handlers.NewTugasHandler(tugasRepo)
	komentarHandler := handlers.NewKomentarHandler(komentarRepo)
	penugasanHandler := handlers.NewPenugasanTugasHandler(penugasanRepo)
	authHandler := handlers.NewAuthHandler(penggunaRepo, cfg)
	log.Println("✅ Handlers initialized")

	// 5. SETUP GIN ROUTER
	// Set mode (release untuk production, debug untuk development)
	gin.SetMode(gin.ReleaseMode) // Ubah ke gin.DebugMode untuk development

	router := gin.New() // Buat router tanpa default middleware

	// 6. APPLY MIDDLEWARE (urutan penting!)
	router.Use(middleware.Recovery())  // Tangkap panic (harus pertama)
	router.Use(middleware.Logger())    // Log requests
	router.Use(middleware.CORS())      // Enable CORS untuk frontend
	log.Println("✅ Middleware applied")

	// 7. SETUP ROUTES
	setupRoutes(router, penggunaHandler, proyekHandler, tugasHandler, komentarHandler, penugasanHandler, authHandler)
	log.Println("✅ Routes configured")

	// 8. CREATE HTTP SERVER
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 9. START SERVER di goroutine (background process)
	go func() {
		log.Printf("🚀 Server starting on http://localhost:%s", cfg.Port)
		log.Println("📡 API endpoints available at http://localhost:" + cfg.Port + "/api/v1")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Failed to start server: %v", err)
		}
	}()

	// 10. GRACEFUL SHUTDOWN
	// Wait untuk interrupt signal (Ctrl+C)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Shutting down server...")

	// Beri waktu 5 detik untuk menyelesaikan request yang masih berjalan
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server stopped gracefully")
}

// setupRoutes mengatur semua routing endpoint
func setupRoutes(
	router *gin.Engine,
	penggunaHandler *handlers.PenggunaHandler,
	proyekHandler *handlers.ProyekHandler,
	tugasHandler *handlers.TugasHandler,
	komentarHandler *handlers.KomentarHandler,
	penugasanHandler *handlers.PenugasanTugasHandler,
	authHandler *handlers.AuthHandler,
) {
	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "OK",
			"message": "Server is running",
		})
	})

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// AUTH ROUTES (Public - tidak perlu token)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)       // POST /api/v1/auth/login
			auth.POST("/register", authHandler.Register) // POST /api/v1/auth/register
		}

		// PENGGUNA ROUTES
		pengguna := v1.Group("/pengguna")
		{
			pengguna.GET("", penggunaHandler.GetAll)                    // GET /api/v1/pengguna
			pengguna.GET("/:id", penggunaHandler.GetByID)               // GET /api/v1/pengguna/:id
			pengguna.GET("/:id/tugas", penugasanHandler.GetUserTasks)   // GET /api/v1/pengguna/:id/tugas
			pengguna.POST("", penggunaHandler.Create)                   // POST /api/v1/pengguna
			pengguna.PUT("/:id", penggunaHandler.Update)                // PUT /api/v1/pengguna/:id
			pengguna.DELETE("/:id", penggunaHandler.Delete)             // DELETE /api/v1/pengguna/:id
		}

		// PROYEK ROUTES
		proyek := v1.Group("/proyek")
		{
			proyek.GET("", proyekHandler.GetAll)                   // GET /api/v1/proyek
			proyek.GET("/:id", proyekHandler.GetByID)              // GET /api/v1/proyek/:id
			proyek.GET("/:id/tugas", tugasHandler.GetByProyekID)   // GET /api/v1/proyek/:id/tugas
			proyek.GET("/:id/komentar", komentarHandler.GetByProyekID) // GET /api/v1/proyek/:id/komentar
			proyek.POST("", proyekHandler.Create)                  // POST /api/v1/proyek
			proyek.PUT("/:id", proyekHandler.Update)               // PUT /api/v1/proyek/:id
			proyek.DELETE("/:id", proyekHandler.Delete)            // DELETE /api/v1/proyek/:id
		}

		// TUGAS ROUTES
		tugas := v1.Group("/tugas")
		{
			tugas.GET("", tugasHandler.GetAll)                              // GET /api/v1/tugas
			tugas.GET("/:id", tugasHandler.GetByID)                         // GET /api/v1/tugas/:id
			tugas.GET("/:id/assigned", penugasanHandler.GetAssignedUsers)   // GET /api/v1/tugas/:id/assigned
			tugas.GET("/:id/komentar", komentarHandler.GetByTugasID)        // GET /api/v1/tugas/:id/komentar
			tugas.POST("", tugasHandler.Create)                             // POST /api/v1/tugas
			tugas.POST("/:id/assign/:userId", penugasanHandler.AssignUser)  // POST /api/v1/tugas/:id/assign/:userId
			tugas.POST("/:id/assign-multiple", penugasanHandler.AssignMultipleUsers) // POST /api/v1/tugas/:id/assign-multiple
			tugas.PUT("/:id", tugasHandler.Update)                          // PUT /api/v1/tugas/:id
			tugas.DELETE("/:id", tugasHandler.Delete)                       // DELETE /api/v1/tugas/:id
			tugas.DELETE("/:id/assign/:userId", penugasanHandler.UnassignUser) // DELETE /api/v1/tugas/:id/assign/:userId
		}

		// KOMENTAR ROUTES
		komentar := v1.Group("/komentar")
		{
			komentar.GET("", komentarHandler.GetAll)          // GET /api/v1/komentar
			komentar.POST("", komentarHandler.Create)         // POST /api/v1/komentar
			komentar.DELETE("/:id", komentarHandler.Delete)   // DELETE /api/v1/komentar/:id
		}
	}
}
