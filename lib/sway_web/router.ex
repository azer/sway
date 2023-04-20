defmodule SwayWeb.Router do
  use SwayWeb, :router

  import SwayWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {SwayWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug :put_user_token
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :api_auth do
    plug SwayWeb.ApiAuthPipeline
  end

  pipeline :api_superuser do
    plug SwayWeb.ApiSuperuserPipeline
  end

  pipeline :attach_workspace do
    plug SwayWeb.BrowserAuthPlugWorkspace
  end

  scope "/", SwayWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    get "/auth/:provider", UserOauthController, :request
    get "/auth/:provider/callback", UserOauthController, :callback
  end


  scope "/api", SwayWeb do
    pipe_through [:api]
    post "/login", ApiSessionController, :create
  end

  # Other scopes may use custom stacks.
  # scope "/api", SwayWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through [:browser, :attach_workspace]

      live_dashboard "/dashboard", metrics: SwayWeb.Telemetry
    end
  end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Website routes
  scope "/", SwayWeb do
    pipe_through [:browser, :attach_workspace]

    get "/", WebsiteController, :index
    resources "/blog", PostController, only: [:show, :index]
  end

  ## Authentication routes

  scope "/", SwayWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    get "/join", UserRegistrationController, :new
    post "/join", UserRegistrationController, :create
    get "/login", UserSessionController, :new
    post "/login", UserSessionController, :create

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
    get "/users/log_in", UserSessionController, :new
    post "/users/log_in", UserSessionController, :create
    get "/users/reset_password", UserResetPasswordController, :new
    post "/users/reset_password", UserResetPasswordController, :create
    get "/users/reset_password/:token", UserResetPasswordController, :edit
    put "/users/reset_password/:token", UserResetPasswordController, :update
  end

  scope "/", SwayWeb do
    pipe_through [:browser, :require_authenticated_user]

    resources "/admin/blog", PostController
    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/", SwayWeb do
    pipe_through [:browser]

    delete "/users/log_out", UserSessionController, :delete
    get "/users/confirm", UserConfirmationController, :new
    post "/users/confirm", UserConfirmationController, :create
    get "/users/confirm/:token", UserConfirmationController, :edit
    post "/users/confirm/:token", UserConfirmationController, :update
  end


  scope "/api", SwayWeb do
    pipe_through [:api, :api_auth, :api_superuser]
    resources "/workspaces", WorkspaceController
    resources "/invites", InviteController
  end

  scope "/api", SwayWeb do
    pipe_through [:api, :api_auth]
    get "/users", UserController, :list_by_workspace
    get "/users/:user_id/updates", StatusController, :list_updates_by_user
    resources "/rooms", RoomController
    get "/rooms/:room_id/members", RoomMemberController, :index
    get "/rooms/:room_id/updates", StatusController, :list_updates_by_room
  end

  scope "/", SwayWeb do
    pipe_through [:browser, :require_authenticated_user]
    get "/", AppController, :index
    get "/:workspace", AppController, :index
    get "/:workspace/room/:room_slug", AppController, :room
    get "/:workspace/room/:room_id/:room_slug", AppController, :private_room
  end

end
