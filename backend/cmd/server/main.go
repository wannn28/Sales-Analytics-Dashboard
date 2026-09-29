package main

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5/pgxpool"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sales-dashboard/internal/config"
	"sales-dashboard/internal/handler"
	"sales-dashboard/internal/repository"
	"sales-dashboard/internal/service"
	"sales-dashboard/migrations"
	"syscall"
	"time"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
func run() error {
	c, err := config.Load()
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	poolConfig, err := pgxpool.ParseConfig(c.DatabaseURL)
	if err != nil {
		return err
	}
	poolConfig.MaxConns = 10
	db, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return err
	}
	defer db.Close()
	if err = db.Ping(ctx); err != nil {
		return err
	}
	if len(os.Args) > 1 && os.Args[1] == "create-admin" {
		return handler.CreateAdmin(ctx, db)
	}
	if len(os.Args) > 1 && (os.Args[1] == "migrate" || os.Args[1] == "seed") {
		file := "001_schema.sql"
		if os.Args[1] == "seed" {
			file = "002_seed.sql"
		}
		sql, err := migrations.Files.ReadFile(file)
		if err != nil {
			return err
		}
		tx, err := db.Begin(ctx)
		if err != nil {
			return err
		}
		defer tx.Rollback(ctx)
		if _, err = tx.Exec(ctx, string(sql)); err != nil {
			return err
		}
		if err = tx.Commit(ctx); err != nil {
			return err
		}
		slog.Info("database command complete", "command", os.Args[1])
		return nil
	}
	server := &http.Server{Addr: c.Address, Handler: handler.Router(&service.Service{Repo: &repository.Repository{DB: db}}), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second}
	stopped := make(chan os.Signal, 1)
	signal.Notify(stopped, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(stopped)
	errs := make(chan error, 1)
	go func() { slog.Info("API listening", "address", c.Address); errs <- server.ListenAndServe() }()
	select {
	case err := <-errs:
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	case <-stopped:
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return server.Shutdown(shutdown)
	}
	return nil
}
