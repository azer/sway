defmodule SwayWeb.UserSessionController do
  use SwayWeb, :controller

  alias Sway.Accounts
  alias SwayWeb.UserAuth

  plug Ueberauth

  def new(conn, _params) do
    render(conn, "new.html", oauth_login_url: oauth_login_url(conn), is_electron: is_electron(conn), error_message: nil)
  end

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    if user = Accounts.get_user_by_email_and_password(email, password) do
      [workspace, _] = Sway.Workspaces.get_membership_and_workspace(user.id)

      conn
      |> put_session(:user_return_to, "/#{workspace.slug}")
      |> UserAuth.log_in_user(user, user_params)
    else
      render(conn, "new.html", oauth_login_url: oauth_login_url(conn), error_message: "Invalid email or password", is_electron: is_electron(conn))
    end
  end

  def delete(conn, _params) do
    conn
    |> put_flash(:info, "Logged out successfully.")
    |> clear_session()
    |> UserAuth.log_out_user()
  end

  defp oauth_login_url(conn) do
    if is_electron(conn) do
      "/desktop/auth/oauth_login"
    else
      Routes.user_oauth_path(conn, :request, "google")
    end
  end

  defp is_electron(conn) do
    user_agent = get_req_header(conn, "user-agent") |> List.first()
    user_agent && String.contains?(user_agent, "Electron")
  end
end
