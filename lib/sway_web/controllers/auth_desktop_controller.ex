defmodule SwayWeb.AuthDesktopController do
  use SwayWeb, :controller
  alias Sway.Guardian

  @default_scope "email profile"
  @request_path "/desktop/auth/oauth_login"
  @callback_path "/desktop/auth/oauth_callback"
  @provider_config {Ueberauth.Strategy.Google, [default_scope: @default_scope, request_path: @request_path, callback_path: @callback_path]}


  def desktop_redirect(conn, _params) do
    {:ok, key, claims} = Guardian.encode_and_sign(conn.assigns.current_user, %{}, auth_time: true)
    render(conn, "desktop_redirect.html", user: conn.assigns.current_user, key: key)
  end

  def oauth_login(conn, _params) do
    conn
    |> Ueberauth.run_request("google", @provider_config)
  end

  def auth_start(conn, %{ "key" => key } = params) do
    case Guardian.decode_and_verify(key, %{}, max_age: {1, :hours}) do
      {:ok, claims} ->
	{:ok, user, claims} = Guardian.resource_from_token(key)

	case SwayWeb.UserOauthController.login_by_email(user.email, user) do
	  {:ok, user, workspace} ->
	     conn
             |> put_session(:user_return_to, "/#{workspace.slug}")
             |> SwayWeb.UserAuth.log_in_user(user)

	  {:error, _reason} ->
	     conn
             |> put_flash(:error, "Oops! You don't have an invite to join Sway yet.")
             |> redirect(to: "/login")
	end

      {:error, :token_expired} ->
	 conn
        |> put_flash(:error, "Oops! There token is expired.")
        |> redirect(to: "/login")
    end
  end

  def oauth_callback(conn, params) do
    conn = Ueberauth.run_callback(conn, "google", @provider_config)
    %{assigns: %{ueberauth_auth: %{info: user_info}}} = conn

    case SwayWeb.UserOauthController.login_by_email(user_info.email, user_info) do
      {:ok, user, workspace} ->
        conn
        |> put_session(:user_return_to, "/desktop/auth/redirect")
        |> SwayWeb.UserAuth.log_in_user(user)

      {:error, _reason} ->
        conn
        |> put_flash(:error, "Oops! You don't have an invite to join Sway yet.")
        |> redirect(to: "/login")
    end
  end
end
