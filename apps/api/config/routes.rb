Rails.application.routes.draw do
  # Liveness / readiness probe used by load balancers and uptime checks.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Basic API metadata — a generic example endpoint for the template.
      get "info", to: "info#show"

      # Authentication (Rails is the source of truth for users and sessions).
      resource :registrations, only: [ :create ]
      resource :sessions, only: [ :create ]
      delete "sessions/current", to: "sessions#destroy", as: :current_session

      # Authenticated example resource: the current user's profile.
      resource :profile, only: [ :show, :update ]

      # Public, read-only access to published content.
      resources :subjects, only: [ :index ]
      get "subjects/:slug/topics", to: "topics#index"
      resources :exercises, only: [ :show ]
    end
  end
end
